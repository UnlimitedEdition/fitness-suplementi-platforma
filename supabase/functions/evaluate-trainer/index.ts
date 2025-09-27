Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { trainerId } = await req.json();

        if (!trainerId) {
            throw new Error('Trainer ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get trainer's training sessions
        const sessionsResponse = await fetch(`${supabaseUrl}/rest/v1/training_sessions?trainer_id=eq.${trainerId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!sessionsResponse.ok) {
            throw new Error('Failed to fetch training sessions');
        }

        const sessions = await sessionsResponse.json();

        // Get trainer reviews
        const reviewsResponse = await fetch(`${supabaseUrl}/rest/v1/trainer_reviews?trainer_id=eq.${trainerId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!reviewsResponse.ok) {
            throw new Error('Failed to fetch trainer reviews');
        }

        const reviews = await reviewsResponse.json();

        // Get client progress for this trainer
        const progressResponse = await fetch(`${supabaseUrl}/rest/v1/client_progress?trainer_id=eq.${trainerId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!progressResponse.ok) {
            throw new Error('Failed to fetch client progress');
        }

        const progressRecords = await progressResponse.json();

        // Calculate KPIs based on PIPFT algorithm from analysis
        
        // 1. Session Attendance Rate (target: >85%)
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const totalSessions = sessions.length;
        const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // 2. Client Retention Rate (target: 60-80%)
        const uniqueClients = [...new Set(sessions.map(s => s.client_id))];
        const activeClients = uniqueClients.filter(clientId => {
            const clientSessions = sessions.filter(s => s.client_id === clientId);
            const lastSession = clientSessions.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0];
            return lastSession && new Date() - new Date(lastSession.scheduled_at) < 30 * 24 * 60 * 60 * 1000; // Active in last 30 days
        });
        const retentionRate = uniqueClients.length > 0 ? (activeClients.length / uniqueClients.length) * 100 : 0;

        // 3. Client Satisfaction Score (target: >80%)
        const avgSatisfaction = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) / 5 * 100 
            : 0;

        // 4. Client Success Rate - based on progress improvement
        let successRate = 0;
        if (progressRecords.length > 0) {
            const clientsWithProgress = {};
            progressRecords.forEach(record => {
                if (!clientsWithProgress[record.client_id]) {
                    clientsWithProgress[record.client_id] = [];
                }
                clientsWithProgress[record.client_id].push(record);
            });

            let successfulClients = 0;
            Object.keys(clientsWithProgress).forEach(clientId => {
                const records = clientsWithProgress[clientId].sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));
                if (records.length >= 2) {
                    const first = records[0];
                    const latest = records[records.length - 1];
                    
                    // Check for improvement in any metric
                    const weightImproved = first.weight && latest.weight && Math.abs(latest.weight - first.weight) > 1;
                    const bodyFatImproved = first.body_fat_percentage && latest.body_fat_percentage && 
                                          (latest.body_fat_percentage < first.body_fat_percentage);
                    const muscleImproved = first.muscle_mass && latest.muscle_mass && 
                                         (latest.muscle_mass > first.muscle_mass);
                    
                    if (weightImproved || bodyFatImproved || muscleImproved) {
                        successfulClients++;
                    }
                }
            });
            
            successRate = Object.keys(clientsWithProgress).length > 0 
                ? (successfulClients / Object.keys(clientsWithProgress).length) * 100 
                : 0;
        }

        // Calculate overall performance score (PIPFT-inspired)
        // Weighted scoring: Attendance (25%) + Retention (25%) + Satisfaction (25%) + Success (25%)
        const attendanceScore = Math.min(attendanceRate / 85 * 25, 25); // Max 25 points
        const retentionScore = Math.min(retentionRate / 70 * 25, 25);   // Max 25 points
        const satisfactionScore = Math.min(avgSatisfaction / 80 * 25, 25); // Max 25 points
        const successScore = Math.min(successRate / 70 * 25, 25);       // Max 25 points
        
        const overallScore = attendanceScore + retentionScore + satisfactionScore + successScore;

        // Determine performance level based on PIPFT scale
        let performanceLevel = 'Najniži';
        if (overallScore >= 81) performanceLevel = 'Najviši';
        else if (overallScore >= 61) performanceLevel = 'Visok';
        else if (overallScore >= 41) performanceLevel = 'Umeren';
        else if (overallScore >= 21) performanceLevel = 'Nizak';

        // Calculate average rating from detailed scores
        const avgDetailedRating = reviews.length > 0 ? {
            professionalism: reviews.reduce((sum, r) => sum + (r.professionalism_score || 0), 0) / reviews.length,
            knowledge: reviews.reduce((sum, r) => sum + (r.knowledge_score || 0), 0) / reviews.length,
            motivation: reviews.reduce((sum, r) => sum + (r.motivation_score || 0), 0) / reviews.length,
            results: reviews.reduce((sum, r) => sum + (r.results_score || 0), 0) / reviews.length
        } : { professionalism: 0, knowledge: 0, motivation: 0, results: 0 };

        // Update trainer profile with calculated scores
        const updateData = {
            rating_average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
            rating_count: reviews.length,
            total_clients: uniqueClients.length,
            success_rate: successRate,
            updated_at: new Date().toISOString()
        };

        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/trainer_profiles?trainer_id=eq.${trainerId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            console.warn('Failed to update trainer profile with new scores');
        }

        return new Response(JSON.stringify({
            data: {
                trainerId,
                kpis: {
                    attendanceRate: Math.round(attendanceRate * 100) / 100,
                    retentionRate: Math.round(retentionRate * 100) / 100,
                    satisfactionScore: Math.round(avgSatisfaction * 100) / 100,
                    successRate: Math.round(successRate * 100) / 100
                },
                scores: {
                    attendance: Math.round(attendanceScore * 100) / 100,
                    retention: Math.round(retentionScore * 100) / 100,
                    satisfaction: Math.round(satisfactionScore * 100) / 100,
                    success: Math.round(successScore * 100) / 100
                },
                overallScore: Math.round(overallScore * 100) / 100,
                performanceLevel,
                detailedRatings: avgDetailedRating,
                totalSessions,
                completedSessions,
                totalClients: uniqueClients.length,
                activeClients: activeClients.length,
                totalReviews: reviews.length,
                progressRecords: progressRecords.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Trainer evaluation error:', error);

        const errorResponse = {
            error: {
                code: 'TRAINER_EVALUATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
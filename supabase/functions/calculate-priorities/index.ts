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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting priority calculation for all users...');

        // Get all user profiles
        const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!profilesResponse.ok) {
            throw new Error('Failed to fetch user profiles');
        }

        const profiles = await profilesResponse.json();
        console.log(`Processing ${profiles.length} user profiles...`);

        // Get all completed orders
        const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?status=eq.completed&select=user_id,total_amount,created_at`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!ordersResponse.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await ordersResponse.json();
        console.log(`Processing ${orders.length} completed orders...`);

        // Get training sessions for additional priority calculation
        const sessionsResponse = await fetch(`${supabaseUrl}/rest/v1/training_sessions?status=eq.completed&select=client_id,price,scheduled_at`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!sessionsResponse.ok) {
            throw new Error('Failed to fetch training sessions');
        }

        const sessions = await sessionsResponse.json();
        console.log(`Processing ${sessions.length} completed training sessions...`);

        const updatedProfiles = [];

        for (const profile of profiles) {
            const userId = profile.user_id;
            
            // Calculate total spent from orders
            const userOrders = orders.filter(order => order.user_id === userId);
            const totalOrderSpent = userOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            
            // Calculate total spent on training sessions
            const userSessions = sessions.filter(session => session.client_id === userId);
            const totalSessionSpent = userSessions.reduce((sum, session) => sum + parseFloat(session.price || 0), 0);
            
            const totalSpent = totalOrderSpent + totalSessionSpent;
            
            // Calculate recency score (more recent = higher priority)
            const now = new Date();
            let recencyScore = 0;
            
            if (userOrders.length > 0 || userSessions.length > 0) {
                const allDates = [
                    ...userOrders.map(o => new Date(o.created_at)),
                    ...userSessions.map(s => new Date(s.scheduled_at))
                ];
                
                const lastActivityDate = new Date(Math.max(...allDates));
                const daysSinceLastActivity = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
                
                // Recency score: 100 for same day, decreasing over time
                recencyScore = Math.max(0, 100 - daysSinceLastActivity);
            }
            
            // Calculate frequency score (more frequent purchases = higher priority)
            const orderFrequency = userOrders.length;
            const sessionFrequency = userSessions.length;
            const totalFrequency = orderFrequency + sessionFrequency;
            
            // Frequency score: 20 points per transaction, capped at 100
            const frequencyScore = Math.min(100, totalFrequency * 20);
            
            // Calculate membership duration score
            const membershipStart = new Date(profile.created_at);
            const membershipDays = Math.floor((now - membershipStart) / (1000 * 60 * 60 * 24));
            const membershipScore = Math.min(50, membershipDays / 10); // Max 50 points for 500+ days
            
            // Priority algorithm based on analysis insights
            // Spending: 40%, Recency: 30%, Frequency: 20%, Membership: 10%
            let priorityScore = 0;
            
            // Spending component (40% weight)
            if (totalSpent >= 2000) priorityScore += 40;
            else if (totalSpent >= 1000) priorityScore += 30;
            else if (totalSpent >= 500) priorityScore += 20;
            else if (totalSpent >= 200) priorityScore += 10;
            
            // Recency component (30% weight)
            priorityScore += (recencyScore / 100) * 30;
            
            // Frequency component (20% weight)
            priorityScore += (frequencyScore / 100) * 20;
            
            // Membership component (10% weight)
            priorityScore += (membershipScore / 50) * 10;
            
            // Determine priority level and membership level
            let priorityLevel = 'basic';
            let membershipLevel = 'standard';
            
            if (priorityScore >= 80) {
                priorityLevel = 'platinum';
                membershipLevel = 'premium';
            } else if (priorityScore >= 60) {
                priorityLevel = 'gold';
                membershipLevel = 'premium';
            } else if (priorityScore >= 40) {
                priorityLevel = 'silver';
                membershipLevel = 'plus';
            } else if (priorityScore >= 20) {
                priorityLevel = 'bronze';
                membershipLevel = 'standard';
            }
            
            // Update profile if priority or spending has changed
            if (profile.total_spent !== totalSpent || 
                profile.priority_level !== priorityLevel || 
                profile.membership_level !== membershipLevel) {
                
                const updateData = {
                    total_spent: totalSpent,
                    priority_level: priorityLevel,
                    membership_level: membershipLevel,
                    updated_at: new Date().toISOString()
                };
                
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (updateResponse.ok) {
                    updatedProfiles.push({
                        userId,
                        totalSpent,
                        priorityLevel,
                        membershipLevel,
                        priorityScore: Math.round(priorityScore * 100) / 100,
                        orderCount: userOrders.length,
                        sessionCount: userSessions.length
                    });
                    
                    // Award bonus points for priority level upgrades
                    if (profile.priority_level !== priorityLevel && priorityLevel !== 'basic') {
                        let bonusPoints = 0;
                        switch (priorityLevel) {
                            case 'bronze': bonusPoints = 100; break;
                            case 'silver': bonusPoints = 250; break;
                            case 'gold': bonusPoints = 500; break;
                            case 'platinum': bonusPoints = 1000; break;
                        }
                        
                        if (bonusPoints > 0) {
                            const pointsData = {
                                user_id: userId,
                                points_earned: bonusPoints,
                                points_spent: 0,
                                points_balance: bonusPoints,
                                source: 'priority_upgrade',
                                description: `Bonus za dostignut ${priorityLevel} nivo`,
                                created_at: new Date().toISOString()
                            };
                            
                            await fetch(`${supabaseUrl}/rest/v1/reward_points`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(pointsData)
                            });
                        }
                    }
                } else {
                    console.warn(`Failed to update profile for user ${userId}`);
                }
            }
        }
        
        console.log(`Priority calculation completed. Updated ${updatedProfiles.length} profiles.`);
        
        // Calculate statistics
        const stats = {
            totalProfiles: profiles.length,
            updatedProfiles: updatedProfiles.length,
            priorityDistribution: {
                basic: updatedProfiles.filter(p => p.priorityLevel === 'basic').length,
                bronze: updatedProfiles.filter(p => p.priorityLevel === 'bronze').length,
                silver: updatedProfiles.filter(p => p.priorityLevel === 'silver').length,
                gold: updatedProfiles.filter(p => p.priorityLevel === 'gold').length,
                platinum: updatedProfiles.filter(p => p.priorityLevel === 'platinum').length
            },
            totalOrdersProcessed: orders.length,
            totalSessionsProcessed: sessions.length
        };

        return new Response(JSON.stringify({
            data: {
                message: 'Priority calculation completed successfully',
                stats,
                updatedProfiles: updatedProfiles.slice(0, 10) // Show first 10 for brevity
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Priority calculation error:', error);

        const errorResponse = {
            error: {
                code: 'PRIORITY_CALCULATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
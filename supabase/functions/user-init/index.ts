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
        const { userData } = await req.json();

        if (!userData || !userData.id || !userData.email) {
            throw new Error('User data is required with id and email');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Create user profile
        const profileData = {
            user_id: userData.id,
            email: userData.email,
            full_name: userData.user_metadata?.full_name || '',
            phone: userData.user_metadata?.phone || '',
            total_spent: 0,
            priority_level: 'basic',
            membership_level: 'standard',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            throw new Error(`Failed to create profile: ${errorText}`);
        }

        const profile = await profileResponse.json();

        // Assign default role as client
        const roleData = {
            user_id: userData.id,
            role: 'client',
            is_active: true,
            permissions: {
                can_purchase: true,
                can_book_sessions: true,
                can_leave_reviews: true
            },
            created_at: new Date().toISOString()
        };

        const roleResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(roleData)
        });

        if (!roleResponse.ok) {
            const errorText = await roleResponse.text();
            console.warn(`Failed to create role: ${errorText}`);
        }

        const role = await roleResponse.json();

        // Initialize reward points
        const pointsData = {
            user_id: userData.id,
            points_earned: 50, // Welcome bonus
            points_spent: 0,
            points_balance: 50,
            source: 'welcome_bonus',
            description: 'Welcome bonus za novi nalog',
            created_at: new Date().toISOString()
        };

        const pointsResponse = await fetch(`${supabaseUrl}/rest/v1/reward_points`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pointsData)
        });

        if (!pointsResponse.ok) {
            console.warn('Failed to initialize reward points');
        }

        return new Response(JSON.stringify({
            data: {
                profile: profile[0],
                role: role[0] || null,
                welcomePoints: 50
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('User initialization error:', error);

        const errorResponse = {
            error: {
                code: 'USER_INIT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
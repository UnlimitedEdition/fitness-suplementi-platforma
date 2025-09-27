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
        const { imageData, fileName, folder = 'general' } = await req.json();

        if (!imageData || !fileName) {
            throw new Error('Image data and filename are required');
        }

        // Get the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Validate and extract base64 data
        let base64Data;
        let mimeType;
        
        if (imageData.startsWith('data:')) {
            const parts = imageData.split(',');
            if (parts.length !== 2) {
                throw new Error('Invalid image data format');
            }
            
            const header = parts[0];
            base64Data = parts[1];
            
            // Extract MIME type
            const mimeMatch = header.match(/data:([^;]+)/);
            if (!mimeMatch) {
                throw new Error('Could not determine image MIME type');
            }
            mimeType = mimeMatch[1];
        } else {
            // Assume it's already base64 without data URL prefix
            base64Data = imageData;
            mimeType = 'image/jpeg'; // Default fallback
        }

        // Validate MIME type
        if (!mimeType.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Convert base64 to binary
        let binaryData;
        try {
            binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        } catch (error) {
            throw new Error('Invalid base64 image data');
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (binaryData.length > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        // Create safe filename
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const finalFileName = `${timestamp}-${safeFileName}`;
        const fullPath = `${folder}/${finalFileName}`;

        console.log(`Uploading image: ${fullPath}, Size: ${binaryData.length} bytes`);

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/platform-images/${fullPath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Storage upload failed:', errorText);
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/platform-images/${fullPath}`;

        console.log(`Image uploaded successfully: ${publicUrl}`);

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                fileName: finalFileName,
                folder,
                size: binaryData.length,
                mimeType
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);

        const errorResponse = {
            error: {
                code: 'IMAGE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
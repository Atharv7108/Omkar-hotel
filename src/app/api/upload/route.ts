import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/upload - Upload images
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Create unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `room-${timestamp}-${randomString}.${extension}`;

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms');
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/rooms/${filename}`;

        return NextResponse.json(
            {
                success: true,
                url: publicUrl,
                filename,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// Optional: DELETE endpoint to remove uploaded images
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json(
                { error: 'No filename provided' },
                { status: 400 }
            );
        }

        // Security: Only allow deletion of files in the rooms directory
        if (!filename.startsWith('room-') || filename.includes('/') || filename.includes('..')) {
            return NextResponse.json(
                { error: 'Invalid filename' },
                { status: 400 }
            );
        }

        const filepath = path.join(process.cwd(), 'public', 'uploads', 'rooms', filename);

        // Delete file (using unlink from fs/promises)
        const { unlink } = await import('fs/promises');
        await unlink(filepath);

        return NextResponse.json(
            { success: true, message: 'File deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

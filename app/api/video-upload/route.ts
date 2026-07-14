import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  try {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not found' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = (formData.get('file') as File) || null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const originalSize = formData.get('originalSize') as string;

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
    }

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'next-cloudinary-uploads',
            eager: [{ quality: 'auto', fetch_format: 'mp4' }],
            eager_async: true,
            chunk_size: 6 * 1024 * 1024,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );

        const webStream = file.stream();
        const reader = webStream.getReader();

        const pump = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                uploadStream.end();
              } else {
                uploadStream.write(value);
                pump();
              }
            })
            .catch(reject);
        };

        pump();
      }
    );

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize: originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

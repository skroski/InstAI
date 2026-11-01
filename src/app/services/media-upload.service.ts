import { Injectable, inject } from '@angular/core';
import { MediaType, PostFormat, PostMedia } from '../data/seed-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class MediaUploadService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Converte um arquivo do sistema local (input file ou drag-and-drop) em objeto PostMedia com preview DataURL
   */
  async processFile(file: File, targetFormat?: PostFormat): Promise<PostMedia> {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|m4v)$/i.test(file.name);
    const mediaType: MediaType = isVideo ? 'video' : 'image';

    const id = `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const name = file.name;
    const size = file.size;

    // Converte arquivo para Data URL para funcionar 100% offline e persistir localmente
    const dataUrl = await this.readFileAsDataUrl(file);

    let thumbnailUrl: string | undefined;
    let aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' = '4:5';

    if (isVideo) {
      try {
        const frame = await this.extractVideoThumbnailAndMetadata(file);
        thumbnailUrl = frame.thumbnail;
        aspectRatio = frame.aspectRatio;
      } catch (e) {
        console.warn('Não foi possível extrair thumbnail do vídeo:', e);
        aspectRatio = targetFormat === 'REELS' || targetFormat === 'STORIES' ? '9:16' : '4:5';
      }
    } else {
      try {
        aspectRatio = await this.detectImageAspectRatio(dataUrl, targetFormat);
      } catch {
        aspectRatio = targetFormat === 'REELS' || targetFormat === 'STORIES' ? '9:16' : '4:5';
      }
    }

    // Se o usuário selecionou Reels ou Stories, preserva o aspect ratio 9:16
    if (targetFormat === 'REELS' || targetFormat === 'STORIES') {
      aspectRatio = '9:16';
    }

    return {
      id,
      url: dataUrl,
      type: mediaType,
      name,
      size,
      aspectRatio,
      thumbnailUrl,
    };
  }

  /**
   * Permite adicionar mídia através de uma URL pública ou CDN
   */
  createMediaFromUrl(
    url: string,
    name?: string,
    typeOverride?: MediaType,
    targetFormat?: PostFormat
  ): PostMedia {
    const isVideo =
      typeOverride === 'video' ||
      /\.(mp4|mov|webm|avi|m4v)(\?.*)?$/i.test(url) ||
      targetFormat === 'REELS';

    const mediaType: MediaType = isVideo ? 'video' : 'image';
    const cleanName = name || (url.split('/').pop()?.split('?')[0] || (isVideo ? 'video.mp4' : 'imagem.jpg'));
    const aspectRatio = targetFormat === 'REELS' || targetFormat === 'STORIES' ? '9:16' : '4:5';

    return {
      id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      url,
      type: mediaType,
      name: cleanName,
      aspectRatio,
      thumbnailUrl: isVideo ? url : undefined,
    };
  }

  /**
   * Valida se a mídia é compatível com as regras do formato no Instagram / Meta
   */
  validateMediaForFormat(mediaList: PostMedia[], format: PostFormat): { valid: boolean; message?: string } {
    if (!mediaList || mediaList.length === 0) {
      return { valid: false, message: 'Nenhuma mídia anexada.' };
    }

    if (format === 'REELS') {
      if (mediaList.length > 1) {
        return { valid: false, message: 'Reels aceita apenas 1 arquivo de vídeo vertical.' };
      }
      if (mediaList[0].type !== 'video') {
        return {
          valid: false,
          message: 'Reels exige formato de vídeo (.mp4, .mov). Para imagens únicas, use o formato Imagem ou Carrossel.',
        };
      }
    }

    if (format === 'CAROUSEL') {
      if (mediaList.length > 10) {
        return { valid: false, message: 'O Instagram permite no máximo 10 mídias por carrossel.' };
      }
    }

    if (format === 'IMAGE') {
      if (mediaList.length > 1) {
        return {
          valid: false,
          message: 'Formato Imagem suporta 1 arte única. Para múltiplas mídias, mude para Carrossel.',
        };
      }
    }

    return { valid: true };
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private detectImageAspectRatio(
    src: string,
    targetFormat?: PostFormat
  ): Promise<'1:1' | '4:5' | '9:16' | '16:9'> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio < 0.65) {
          resolve('9:16');
        } else if (ratio < 0.88) {
          resolve('4:5');
        } else if (ratio < 1.15) {
          resolve('1:1');
        } else {
          resolve('16:9');
        }
      };
      img.onerror = () => {
        resolve(targetFormat === 'REELS' || targetFormat === 'STORIES' ? '9:16' : '4:5');
      };
      img.src = src;
    });
  }

  private extractVideoThumbnailAndMetadata(
    file: File
  ): Promise<{ thumbnail: string; aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2 || 0.5);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 720;
          canvas.height = video.videoHeight || 1280;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.85);
            const ratio = canvas.width / canvas.height;
            let ar: '1:1' | '4:5' | '9:16' | '16:9' = '9:16';
            if (ratio < 0.65) ar = '9:16';
            else if (ratio < 0.88) ar = '4:5';
            else if (ratio < 1.15) ar = '1:1';
            else ar = '16:9';

            URL.revokeObjectURL(objUrl);
            resolve({ thumbnail: thumb, aspectRatio: ar });
          } else {
            URL.revokeObjectURL(objUrl);
            resolve({ thumbnail: '', aspectRatio: '9:16' });
          }
        } catch (err) {
          URL.revokeObjectURL(objUrl);
          reject(err);
        }
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(objUrl);
        reject(e);
      };
    });
  }
}


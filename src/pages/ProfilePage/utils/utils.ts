export type AvatarOptions = {
    maxSide?: number;
    mime?: string;
    quality?: number;
    maxBytesAnimated?: number;
};

const textFrom = (bytes: Uint8Array, start: number, len: number) =>
    String.fromCharCode(...bytes.slice(start, start + len));

async function readHead(file: File, cap = 128 * 1024): Promise<Uint8Array> {
    const buf = await file.slice(0, Math.min(file.size, cap)).arrayBuffer();
    return new Uint8Array(buf);
}

function isAnimatedGIF(head: Uint8Array): boolean {
    const sig = textFrom(head, 0, 6);
    if (!(sig === "GIF87a" || sig === "GIF89a")) return false;
    let frames = 0;
    for (let i = 0; i < head.length; i++) {
        if (head[i] === 0x2c) {
            frames++;
            if (frames > 1) return true;
        }
    }
    return false;
}

function isAnimatedPNG(head: Uint8Array): boolean {
    const pngSignature = [137,80,78,71,13,10,26,10];
    for (let i = 0; i < pngSignature.length; i++) {
        if (head[i] !== pngSignature[i]) return false;
    }
    const needle = "acTL";
    const hay = new TextDecoder().decode(head);
    return hay.includes(needle);
}

function readU32LE(bytes: Uint8Array, off: number): number {
    return bytes[off] | (bytes[off+1] << 8) | (bytes[off+2] << 16) | (bytes[off+3] << 24);
}

function isAnimatedWebP(head: Uint8Array): boolean {
    if (textFrom(head, 0, 4) !== "RIFF") return false;
    if (textFrom(head, 8, 4) !== "WEBP") return false;
    let p = 12;
    while (p + 8 <= head.length) {
        const fourCC = textFrom(head, p, 4);
        const size = readU32LE(head, p + 4);
        const dataStart = p + 8;
        if (fourCC === "VP8X") {
            const flags = head[dataStart];
            if ((flags & 0x02) !== 0) return true;
        }
        if (fourCC === "ANIM" || fourCC === "ANMF") return true;
        const chunkLen = 8 + ((size + 1) & ~1);
        p += chunkLen;
    }
    return false;
}

async function readAsDataURL(file: File): Promise<string> {
    return await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onerror = () => rej(fr.error || new Error("readAsDataURL error"));
        fr.onload = () => res(String(fr.result));
        fr.readAsDataURL(file);
    });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
    try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        const blobURL = URL.createObjectURL(file);
        try {
            const img = await new Promise<HTMLImageElement>((res, rej) => {
                const i = new Image();
                i.onload = () => res(i);
                i.onerror = rej;
                i.src = blobURL;
            });
            return img;
        } finally {
            URL.revokeObjectURL(blobURL);
        }
    }
}

export async function fileToAvatarDataURL(
    file: File,
    {
        maxSide = 256,
        mime = "image/webp",
        quality = 0.85,
        maxBytesAnimated = 5 * 1024 * 1024
    }: AvatarOptions = {}
): Promise<{ dataURL: string; animated: boolean; mime: string }> {

    if (!file.type.startsWith("image/")) {
        throw new Error("Пожалуйста, выберите изображение.");
    }

    const head = await readHead(file);

    const animated =
        (file.type === "image/gif" && isAnimatedGIF(head)) ||
        (file.type === "image/webp" && isAnimatedWebP(head)) ||
        (file.type === "image/png" && isAnimatedPNG(head));

    if (animated) {
        if (file.size > maxBytesAnimated) {
            throw new Error("Анимированное изображение слишком большое (> лимита).");
        }
        const dataURL = await readAsDataURL(file);
        return { dataURL, animated: true, mime: file.type };
    }

    const bmp = await loadBitmap(file);
    const width = (bmp as any).width;
    const height = (bmp as any).height;

    const scale = Math.min(1, maxSide / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(bmp as any, 0, 0, w, h);

    let out = canvas.toDataURL(mime, quality);
    if (mime === "image/webp" && out.startsWith("data:image/png")) {
        out = canvas.toDataURL("image/png");
    }

    return { dataURL: out, animated: false, mime: out.substring(5, out.indexOf(";")) };
}
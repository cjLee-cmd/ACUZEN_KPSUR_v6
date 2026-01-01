/**
 * OCR Helper
 * Tesseract.js를 사용한 이미지 기반 PDF OCR 처리
 */

class OCRHelper {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.supportedLanguages = ['kor', 'eng'];
    }

    /**
     * Tesseract 워커 초기화
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        // Tesseract.js 라이브러리 확인
        if (typeof Tesseract === 'undefined') {
            console.error('❌ Tesseract.js library not loaded');
            return false;
        }

        try {
            console.log('🔄 Initializing Tesseract OCR worker...');

            this.worker = await Tesseract.createWorker('kor+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        console.log(`📝 OCR Progress: ${progress}%`);
                    }
                }
            });

            this.isInitialized = true;
            console.log('✅ Tesseract OCR worker initialized');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize Tesseract:', error.message);
            return false;
        }
    }

    /**
     * PDF 페이지를 캔버스로 렌더링
     * @param {Object} page - PDF.js 페이지 객체
     * @param {number} scale - 렌더링 스케일 (기본 2.0)
     * @returns {Promise<HTMLCanvasElement>}
     */
    async renderPageToCanvas(page, scale = 2.0) {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        return canvas;
    }

    /**
     * 캔버스 이미지에서 OCR 수행
     * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
     * @returns {Promise<string>} 추출된 텍스트
     */
    async recognizeFromCanvas(canvas) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('OCR 초기화 실패');
            }
        }

        try {
            const result = await this.worker.recognize(canvas);
            return result.data.text;
        } catch (error) {
            console.error('❌ OCR recognition failed:', error.message);
            throw error;
        }
    }

    /**
     * PDF 파일에서 OCR로 텍스트 추출
     * @param {ArrayBuffer} arrayBuffer - PDF 파일 ArrayBuffer
     * @param {string} fileName - 파일명 (로깅용)
     * @returns {Promise<Object>} OCR 결과
     */
    async extractTextFromPDF(arrayBuffer, fileName) {
        // PDF.js 라이브러리 확인
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }

        console.log(`🔍 Starting OCR for: ${fileName}`);

        try {
            // PDF 로드
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            const totalPages = pdf.numPages;

            console.log(`📄 PDF has ${totalPages} pages, starting OCR...`);

            // 각 페이지에서 OCR 수행
            for (let i = 1; i <= totalPages; i++) {
                console.log(`🔄 Processing page ${i}/${totalPages}...`);

                const page = await pdf.getPage(i);
                const canvas = await this.renderPageToCanvas(page, 2.0);
                const pageText = await this.recognizeFromCanvas(canvas);

                fullText += `\n--- Page ${i} ---\n`;
                fullText += pageText.trim();
                fullText += '\n';

                // 캔버스 정리
                canvas.width = 0;
                canvas.height = 0;
            }

            console.log(`✅ OCR complete for: ${fileName}`);

            return {
                success: true,
                text: fullText.trim(),
                pageCount: totalPages,
                method: 'ocr'
            };

        } catch (error) {
            console.error(`❌ OCR failed for ${fileName}:`, error.message);
            return {
                success: false,
                text: '',
                error: error.message,
                method: 'ocr'
            };
        }
    }

    /**
     * 이미지 파일에서 OCR로 텍스트 추출
     * @param {File|Blob} imageFile - 이미지 파일
     * @returns {Promise<string>} 추출된 텍스트
     */
    async extractTextFromImage(imageFile) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('OCR 초기화 실패');
            }
        }

        try {
            const result = await this.worker.recognize(imageFile);
            return result.data.text;
        } catch (error) {
            console.error('❌ Image OCR failed:', error.message);
            throw error;
        }
    }

    /**
     * 워커 종료
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
            console.log('✅ Tesseract worker terminated');
        }
    }

    /**
     * OCR 가능 여부 확인
     */
    isAvailable() {
        return typeof Tesseract !== 'undefined';
    }
}

// Singleton instance
const ocrHelper = new OCRHelper();

export default ocrHelper;

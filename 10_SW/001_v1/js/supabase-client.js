/**
 * Supabase Client
 * Supabase 데이터베이스 연결 및 쿼리 헬퍼
 */

import { CONFIG } from './config.js';

class SupabaseClient {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    /**
     * Supabase 클라이언트 초기화
     */
    async init() {
        if (this.initialized) {
            return this.client;
        }

        try {
            // Supabase SDK 로드 확인
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase SDK not loaded');
            }

            const { createClient } = supabase;
            this.client = createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_ANON_KEY
            );

            this.initialized = true;
            console.log('✅ Supabase client initialized');
            return this.client;

        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            throw error;
        }
    }

    /**
     * 사용자 인증 - 이메일/비밀번호
     */
    async signInWithPassword(email, password) {
        await this.init();

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('✅ User signed in:', data.user.email);
            return { success: true, user: data.user, session: data.session };

        } catch (error) {
            console.error('❌ Sign in failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 사용자 로그아웃
     */
    async signOut() {
        await this.init();

        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;

            console.log('✅ User signed out');
            return { success: true };

        } catch (error) {
            console.error('❌ Sign out failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 현재 세션 가져오기
     */
    async getSession() {
        await this.init();

        try {
            const { data, error } = await this.client.auth.getSession();
            if (error) throw error;

            return { success: true, session: data.session };

        } catch (error) {
            console.error('❌ Get session failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 보고서 목록 조회
     */
    async getReports(userId) {
        await this.init();

        try {
            const { data, error } = await this.client
                .from('reports')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Retrieved ${data.length} reports`);
            return { success: true, reports: data };

        } catch (error) {
            console.error('❌ Get reports failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 새 보고서 생성
     */
    async createReport(reportData) {
        await this.init();

        try {
            const { data, error } = await this.client
                .from('reports')
                .insert([reportData])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Report created:', data.report_name);
            return { success: true, report: data };

        } catch (error) {
            console.error('❌ Create report failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 보고서 업데이트
     */
    async updateReport(reportId, updates) {
        await this.init();

        try {
            const { data, error } = await this.client
                .from('reports')
                .update(updates)
                .eq('id', reportId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Report updated:', reportId);
            return { success: true, report: data };

        } catch (error) {
            console.error('❌ Update report failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 파일 업로드 (Supabase Storage)
     */
    async uploadFile(bucket, path, file) {
        await this.init();

        try {
            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            console.log('✅ File uploaded:', path);
            return { success: true, path: data.path };

        } catch (error) {
            console.error('❌ File upload failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 파일 다운로드 URL 가져오기
     */
    async getFileUrl(bucket, path) {
        await this.init();

        try {
            const { data } = this.client.storage
                .from(bucket)
                .getPublicUrl(path);

            console.log('✅ File URL retrieved:', path);
            return { success: true, url: data.publicUrl };

        } catch (error) {
            console.error('❌ Get file URL failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 범용 쿼리 실행
     */
    async query(table) {
        await this.init();
        return this.client.from(table);
    }
}

// Singleton instance
const supabaseClient = new SupabaseClient();

export default supabaseClient;

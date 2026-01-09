'use server';

import { supabase as staticSupabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string;
    published: boolean;
    created_at: string;
    // SEO & CMS Fields
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
    alt_text?: string;
    category?: string;
    tags?: string[]; // Array of strings for tags
    is_featured?: boolean;
}

// Helper to create authenticated client from token
function createAuthClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        }
    );
}

export async function getPosts(limit?: number) {
    try {
        let query = staticSupabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as BlogPost[];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function getAllPostsAdmin() {
    try {
        const { data, error } = await staticSupabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        return [];
    }
}

export async function getPostBySlug(slug: string) {
    try {
        const { data, error } = await staticSupabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data as BlogPost;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export async function savePost(post: Partial<BlogPost>, token?: string) {
    try {
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Token não fornecido.' };
        }

        const supabase = createAuthClient(token);

        // Use getUser to verify the token is valid on the server
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return { success: false, error: 'Sessão inválida ou expirada.' };
        }

        const payload = {
            ...post,
            slug: post.slug || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('posts')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath(`/blog/${data.slug}`);
        revalidatePath('/admin/blog');

        return { success: true, data };
    } catch (error: any) {
        console.error('Error saving post:', error);
        return { success: false, error: error.message || 'Erro desconhecido ao salvar post' };
    }
}

export async function deletePost(id: string, token?: string) {
    try {
        if (!token) return false;

        const supabase = createAuthClient(token);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        return false;
    }
}

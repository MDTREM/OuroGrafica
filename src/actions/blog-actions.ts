'use server';

import { supabase } from '@/lib/supabase';
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

export async function getPosts(limit?: number) {
    try {
        let query = supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug) // Remove .eq('published', true) to allow preview if needed, or handle in page
            .single();

        if (error) return null;
        return data as BlogPost;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export async function savePost(post: Partial<BlogPost>) {
    try {
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
    } catch (error) {
        console.error('Error saving post:', error);
        return { success: false, error };
    }
}

export async function deletePost(id: string) {
    try {
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

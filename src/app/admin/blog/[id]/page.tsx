import { AdminPostEditor } from '@/components/admin/AdminPostEditor';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// Server Component for fetching data
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (!post) {
        notFound();
    }

    return <AdminPostEditor initialData={post} isNew={false} />;
}

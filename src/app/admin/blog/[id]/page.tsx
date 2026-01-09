import { AdminPostEditor } from '@/components/admin/AdminPostEditor';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// Server Component for fetching data
export default async function EditPostPage({ params }: { params: { id: string } }) {
    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!post) {
        notFound();
    }

    return <AdminPostEditor initialData={post} isNew={false} />;
}

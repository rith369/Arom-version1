import { redirect } from 'next/navigation';

// Content now lives on the MindGuide page. Kept so old links still work.
export default function ContentPage() {
  redirect('/admin/mindguide');
}

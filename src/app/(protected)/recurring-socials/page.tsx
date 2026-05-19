import { RecurringSocialsPage } from '@/features/recurring-socials/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tự động tạo Social | Pickleball Social',
  description: 'Quản lý và tạo lịch social tự động định kỳ',
};

export default function RecurringSocialsPageRoute() {
  return <RecurringSocialsPage />;
}

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/page-container';
import { RecurringSocialsForm } from './recurring-socials-form';
import { RecurringSocialsList } from './recurring-socials-list';
import { MOCK_RECURRING_SOCIALS } from '../recurring-socials.mock';
import { RecurringSocialTemplate } from '../recurring-socials.types';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RecurringSocialsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [socials, setSocials] = useState<RecurringSocialTemplate[]>(MOCK_RECURRING_SOCIALS);
  const { toast } = useToast();

  const handleCreateSocial = (data: any) => {
    // Mock: thêm social mới vào danh sách
    const newSocial: RecurringSocialTemplate = {
      id: `rs-${Date.now()}`,
      name: data.name,
      description: data.description,
      socialType: data.socialType,
      skillLevel: data.skillLevel,
      startTime: data.startTime,
      endTime: data.endTime,
      courts: data.selectedCourts,
      maxParticipants: data.maxParticipants,
      maxPerCourt: data.maxPerCourt,
      maxWaitlist: data.maxWaitlist,
      fee: data.fee,
      courtRentFee: data.courtRentFee,
      costNote: data.costNote,
      recurrenceType: data.recurrenceType,
      daysOfWeek: data.daysOfWeek,
      dayOfMonth: data.dayOfMonth,
      quarterDay: data.quarterDay,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'active',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSocials([newSocial, ...socials]);
    setActiveTab('list');

    toast({
      title: 'Thành công',
      description: `Đã tạo ${data.schedulePreview?.length || 0} buổi social tự động`,
    });
  };

  const handlePauseSocial = (id: string) => {
    setSocials(
      socials.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    );

    const social = socials.find(s => s.id === id);
    toast({
      title: 'Thành công',
      description: `${social?.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'} social: ${social?.name}`,
    });
  };

  const handleDeleteSocial = (id: string) => {
    const social = socials.find(s => s.id === id);
    setSocials(socials.filter(s => s.id !== id));

    toast({
      title: 'Thành công',
      description: `Đã xóa social: ${social?.name}`,
      variant: 'destructive',
    });
  };

  const handleEditSocial = (social: RecurringSocialTemplate) => {
    toast({
      title: 'Thông báo',
      description: 'Chức năng chỉnh sửa sẽ được cập nhật trong phiên bản tiếp theo',
    });
  };

  const handleViewSocial = (social: RecurringSocialTemplate) => {
    toast({
      title: social.name,
      description: `Loại: ${social.socialType} | Trạng thái: ${social.status}`,
    });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tự động tạo Social
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Thiết lập lịch social định kỳ tự động cho hệ thống quản lý Pickleball Social
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'create' | 'list')}>
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="list" className="gap-2">
              Danh sách
              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                {socials.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="size-4" />
              Tạo mới
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            <RecurringSocialsList
              socials={socials}
              onEdit={handleEditSocial}
              onPause={handlePauseSocial}
              onDelete={handleDeleteSocial}
              onView={handleViewSocial}
            />
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tạo Social Tự động Mới</CardTitle>
                <CardDescription>
                  Điền vào các thông tin dưới đây để tạo một lịch social tự động
                </CardDescription>
              </CardHeader>
            </Card>

            <RecurringSocialsForm onSubmit={handleCreateSocial} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecurringSocialTemplate } from '../recurring-socials.types';

interface RecurringSocialsFiltersProps {
  onFilterChange: (filter: string) => void;
  defaultValue?: string;
}

export function RecurringSocialsFilters({
  onFilterChange,
  defaultValue = 'all',
}: RecurringSocialsFiltersProps) {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="weekly">Hàng tuần</TabsTrigger>
        <TabsTrigger value="monthly">Hàng tháng</TabsTrigger>
        <TabsTrigger value="quarterly">Hàng quý</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

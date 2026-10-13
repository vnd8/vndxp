import React from 'react';
import { PremiereNoNeedApp } from './PremiereNoNeedApp';

interface SnakeGameAppProps {
  lang?: 'en' | 'ar';
  onOpenInquiry?: () => void;
  onOpenWorks?: () => void;
}

export const SnakeGameApp: React.FC<SnakeGameAppProps> = ({
  lang = 'ar',
  onOpenInquiry,
  onOpenWorks,
}) => {
  return (
    <PremiereNoNeedApp
      lang={lang}
      onOpenInquiry={onOpenInquiry}
      onOpenWorks={onOpenWorks}
    />
  );
};

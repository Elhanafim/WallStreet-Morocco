import React from 'react';
import EduBannerInline from '@/components/legal/EduBannerInline';

/**
 * Inserts an <EduBannerInline /> after every 2nd element in the provided array.
 */
export function injectEduBanners(sections: React.ReactNode[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  sections.forEach((section, i) => {
    result.push(section);
    if ((i + 1) % 2 === 0 && i < sections.length - 1) {
      result.push(<EduBannerInline key={`edu-banner-${i}`} />);
    }
  });
  return result;
}

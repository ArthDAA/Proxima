import React from 'react';
import { Input } from "@/components/ui/input";

export const AdaptiveInput = ({ onSend, ...props }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <Input
      {...props}
      onKeyPress={handleKeyPress}
      // Mobile: désactive le zoom automatique
      style={{
        ...props.style,
        fontSize: isWeb() ? '14px' : '16px', // 16px empêche le zoom sur iOS
      }}
    />
  );
};
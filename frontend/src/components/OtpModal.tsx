import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface OtpModalProps {
  open: boolean;
  title?: string;
  onSubmit: (code: string) => Promise<void> | void;
  onClose: () => void;
}

export function OtpModal({ open, title = 'Enter OTP', onSubmit, onClose }: OtpModalProps) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const valid = /^[0-9]{6}$/.test(code);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await onSubmit(code);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md"
      >
        <Card className="border-0">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-2">6-digit code</label>
              <Input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center tracking-widest text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">Ask the customer for the OTP shown in their app.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!valid || submitting}>Confirm</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

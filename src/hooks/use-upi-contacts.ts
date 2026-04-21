import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UpiContact {
  id: string;
  name: string;
  upiId: string;
  category: string;
  lastPaidAmount: number | null;
  lastPaidAt: string | null;
}

export function useUpiContacts(userId?: string) {
  const [contacts, setContacts] = useState<UpiContact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from('upi_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('last_paid_at', { ascending: false, nullsFirst: false });

      if (!error && data) {
        setContacts(data.map((r) => ({
          id: r.id,
          name: r.name || '',
          upiId: r.upi_id || '',
          category: r.category || '',
          lastPaidAmount: r.last_paid_amount,
          lastPaidAt: r.last_paid_at,
        })));
      }
      setIsLoaded(true);
    })();
  }, [userId]);

  const saveContact = async (input: { name: string; upiId: string; category: string }) => {
    if (!userId || !input.upiId.trim()) return null;

    // Check existing by upi_id + user
    const existing = contacts.find(c => c.upiId.toLowerCase() === input.upiId.trim().toLowerCase());
    if (existing) return existing;

    const id = crypto.randomUUID();
    const row = {
      id,
      user_id: userId,
      name: input.name.trim() || input.upiId.split('@')[0],
      upi_id: input.upiId.trim(),
      category: input.category,
    };
    const { error } = await supabase.from('upi_contacts').insert(row);
    if (error) return null;

    const newContact: UpiContact = {
      id,
      name: row.name,
      upiId: row.upi_id,
      category: row.category,
      lastPaidAmount: null,
      lastPaidAt: null,
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  const updateLastPaid = async (contactId: string, amount: number) => {
    const now = new Date().toISOString();
    await supabase
      .from('upi_contacts')
      .update({ last_paid_amount: amount, last_paid_at: now })
      .eq('id', contactId);
    setContacts(prev => prev.map(c =>
      c.id === contactId ? { ...c, lastPaidAmount: amount, lastPaidAt: now } : c
    ));
  };

  const deleteContact = async (id: string) => {
    await supabase.from('upi_contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return { contacts, isLoaded, saveContact, updateLastPaid, deleteContact };
}

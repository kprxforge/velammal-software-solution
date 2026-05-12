import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, CheckCircle2, XCircle, Eye, Search, 
  ExternalLink, Calendar, User, Mail, IndianRupee,
  ShieldCheck, AlertCircle, Download, Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function RevenueVault() {
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  useEffect(() => {
    const fetchAllPayments = async () => {
      const { data: intData } = await supabase.from('internship_applications').select('*').order('createdAt', { ascending: false });
      const { data: prjData, error: prjError } = await supabase
        .from('project_requests')
        .select('id,userid,clientname,email,projectname,description,budget,status,paymentstatus,paymentscreenshoturl,type,createdat')
        .order('createdat', { ascending: false });
      if (prjError) console.error('Failed to fetch project_requests:', prjError.message);
      const { data: txData } = await supabase.from('transactions').select('*').order('createdAt', { ascending: false });

      const combined = [
        ...(intData || []).map(d => ({ ...d, type: 'internship' })),
        ...(prjData || []).map(d => ({
          ...d,
          type: 'project',
          fullName: d.clientname || 'Anonymous Identity',
          projectTitle: d.projectname || 'Special Request',
          paymentStatus: d.paymentstatus || 'none',
          paymentScreenshotUrl: d.paymentscreenshoturl || '',
          createdAt: d.createdat
        })),
        ...(txData || []).map(d => ({ ...d, type: 'marketplace_sale' }))
      ].sort((a, b) => {
        const dateA = a.createdAt || a.created_at || a.createdat || 0;
        const dateB = b.createdAt || b.created_at || b.createdat || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setPayments(combined);
    };

    fetchAllPayments();

    const channel = supabase.channel('revenue_vault_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internship_applications' }, fetchAllPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_requests' }, fetchAllPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchAllPayments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updatePaymentStatus = async (id: string, type: string, status: string) => {
    const table = type === 'internship' ? 'internship_applications' : 
                  type === 'project' ? 'project_requests' : 'transactions';
    const statusField = type === 'marketplace_sale'
      ? 'status'
      : type === 'project'
      ? 'paymentstatus'
      : 'paymentStatus';
    try {
      const { error } = await supabase
        .from(table)
        .update({ [statusField]: status })
        .eq('id', id);
      
      if (error) throw error;

      if (selectedPayment?.id === id) {
        setSelectedPayment({ ...selectedPayment, [statusField]: status });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const filteredPayments = payments.filter(pay => {
    const matchesSearch = pay.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pay.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pay.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const payStatus = pay.paymentStatus || pay.paymentstatus || pay.status;
    const matchesStatus = filterStatus === 'all' || payStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-white uppercase tracking-tighter mb-2">Revenue Vault</h2>
          <p className="text-white/40 text-sm">Financial transaction ledger and asset verification matrix.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Ledger..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-sans focus:outline-none focus:border-cyan-400 transition-all text-sm"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-display text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Transactions</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending Proof</option>
            <option value="verified">Verified Assets</option>
            <option value="rejected">Rejected Entry</option>
          </select>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-emerald-400/5 to-transparent">
          <p className="font-display text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Verified Revenue</p>
          <h3 className="font-display text-4xl font-bold text-white tracking-tighter">
            ₹{payments.filter(p => (p.paymentStatus || p.paymentstatus || p.status) === 'verified').reduce((acc, curr) => acc + (curr.internshipFee || curr.price || 0), 0).toLocaleString()}
          </h3>
        </div>
        <div className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-amber-400/5 to-transparent">
          <p className="font-display text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Awaiting Review</p>
          <h3 className="font-display text-4xl font-bold text-white tracking-tighter">
            {payments.filter(p => (p.paymentStatus || p.paymentstatus || p.status) === 'pending' || (p.paymentStatus || p.paymentstatus || p.status) === 'pending_verification').length}
          </h3>
        </div>
        <div className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-cyan-400/5 to-transparent">
          <p className="font-display text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Total Processing</p>
          <h3 className="font-display text-4xl font-bold text-white tracking-tighter">
            {payments.length}
          </h3>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-8 py-6 font-display text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Benefactor</th>
                <th className="px-8 py-6 font-display text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Protocol</th>
                <th className="px-8 py-6 font-display text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Status</th>
                <th className="px-8 py-6 font-display text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-black text-xs text-white/30 group-hover:text-cyan-400 transition-colors">
                        {(pay.fullName || pay.buyerEmail || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-sans font-bold text-white text-base">{pay.fullName || 'Anonymous Identity'}</p>
                        <p className="font-mono text-[10px] text-white/20 uppercase">{pay.email || pay.buyerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="font-display text-[10px] font-black text-white/60 uppercase tracking-widest">{pay.type}</p>
                      <p className="font-sans text-xs text-white/20">{pay.internshipTitle || pay.projectTitle || 'Special Request'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                      (pay.paymentStatus || pay.paymentstatus || pay.status) === 'verified' ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_10px_#10b98120]" :
                      (pay.paymentStatus || pay.paymentstatus || pay.status) === 'rejected' ? "text-red-400 border-red-400/20 bg-red-400/5 shadow-[0_0_10px_#ef444420]" :
                      (pay.paymentStatus || pay.paymentstatus || pay.status) === 'unpaid' ? "text-white/40 border-white/10 bg-white/5" :
                      "text-amber-400 border-amber-400/20 bg-amber-400/5 shadow-[0_0_10px_#f59e0b20]"
                    )}>
                      {pay.paymentStatus || pay.paymentstatus || pay.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedPayment(pay)}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl font-display text-[10px] font-black text-white uppercase tracking-widest hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all"
                    >
                      Audit Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/10">
                <AlertCircle className="w-8 h-8 text-white/10" />
              </div>
              <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No matching transactions found in the vault.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-5xl glass border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.15)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 h-[80vh]">
                {/* Info Panel */}
                <div className="lg:col-span-2 p-12 space-y-12 h-full overflow-y-auto hide-scrollbar">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-display font-black text-3xl text-white shadow-xl">
                      {(selectedPayment.fullName || selectedPayment.buyerEmail || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-bold text-white uppercase tracking-tighter leading-none mb-2">{selectedPayment.fullName || 'Anonymous Identity'}</h3>
                      <p className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{selectedPayment.email || selectedPayment.buyerEmail}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-white/20 font-display text-[9px] font-black uppercase tracking-widest">Entry Node</p>
                      <p className="text-white font-sans text-base">{selectedPayment.type}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-white/20 font-display text-[9px] font-black uppercase tracking-widest">Enrollment Time</p>
                      <p className="text-white font-sans text-base">{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleDateString() : 'Recent'}</p>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-4">
                    <h4 className="font-display text-[10px] font-black text-white uppercase tracking-[0.3em]">Transaction Breakdown</h4>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-white/30 text-xs">Base Protocol Fee</span>
                      <span className="text-white font-mono text-lg font-bold">₹{selectedPayment.internshipFee || selectedPayment.price || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <span className="text-white/30 text-xs">Payment Method</span>
                      <span className="text-cyan-400 font-mono text-xs uppercase cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        UPI Gateway
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => updatePaymentStatus(selectedPayment.id, selectedPayment.type, 'rejected')}
                      className="flex-1 py-5 rounded-[1.5rem] border border-red-500/20 text-red-500 font-display text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
                    >
                      <XCircle className="w-5 h-5 mx-auto mb-2 opacity-60 group-hover:opacity-100" />
                      Decline Proof
                    </button>
                    <button 
                      onClick={() => updatePaymentStatus(selectedPayment.id, selectedPayment.type, 'verified')}
                      className="flex-1 py-5 rounded-[1.5rem] bg-emerald-500 text-black font-display text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all group"
                    >
                      <ShieldCheck className="w-5 h-5 mx-auto mb-2 opacity-60 group-hover:opacity-100" />
                      Verify Asset
                    </button>
                  </div>
                </div>

                {/* Proof Visualizers */}
                <div className="lg:col-span-3 bg-black flex flex-col p-12 border-l border-white/5 relative overflow-hidden">
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Verification Matrix
                      </h4>
                      <a 
                        href={selectedPayment.paymentScreenshotUrl} 
                        target="_blank" 
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>

                    <div className="flex-1 glass rounded-[3rem] border border-white/10 overflow-hidden relative group/img">
                      {selectedPayment.paymentScreenshotUrl ? (
                         <img 
                           src={selectedPayment.paymentScreenshotUrl} 
                           alt="Screenshot Proof" 
                           className="w-full h-full object-contain p-8 group-hover/img:scale-110 transition-transform duration-1000"
                         />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                           <div className="w-24 h-24 bg-white/5 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                              <AlertCircle className="w-12 h-12 text-white/10" />
                           </div>
                           <p className="font-display text-lg font-bold text-white/20 uppercase tracking-tighter">No Visual Proof Uploaded</p>
                           <p className="text-white/10 font-sans text-xs max-w-xs">The student has not uploaded a screenshot to the secure repository yet.</p>
                        </div>
                      )}
                      
                      {/* Scanline Effect */}
                      {selectedPayment.paymentScreenshotUrl && (
                        <motion.div 
                          animate={{ top: ['0%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-cyan-400/30 blur-[2px] shadow-[0_0_15px_#22d3ee] z-20 pointer-events-none"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
                </div>
              </div>

              <button 
                onClick={() => setSelectedPayment(null)}
                className="absolute top-12 right-12 p-4 glass rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all z-[210]"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

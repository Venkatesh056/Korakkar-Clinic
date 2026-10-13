import React, { useState } from 'react';
import {
  Patient,
  Prescription,
  Bill,
  Product,
  PrescriptionMedicine,
  User,
} from '../../types';
import { storage } from '../../services/storage';
import { formatINR } from '../../services/calculation';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Receipt,
  FileClock,
  Sparkles,
  Edit2,
  Clock,
  ClipboardList,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface PatientManagementViewProps {
  patients: Patient[];
  prescriptions: Prescription[];
  bills: Bill[];
  products: Product[];
  currentUser: User;
  onPatientUpdated: (updatedList: Patient[]) => void;
  onPrescriptionAdded: (newRx: Prescription) => void;
  onDirectBillPatient: (patient: Patient, prescription?: Prescription) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  patients,
  prescriptions,
  bills,
  products,
  currentUser,
  onPatientUpdated,
  onPrescriptionAdded,
  onDirectBillPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  // Add / Edit Patient Modal
  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    mobile: '',
    address: '',
    notes: '',
  });
  const [patientFormError, setPatientFormError] = useState<string>('');

  // Add Prescription Modal
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [rxDoctorName, setRxDoctorName] = useState<string>('Dr. K. Ramalingam, B.S.M.S.');
  const [rxDate, setRxDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [rxNotes, setRxNotes] = useState<string>('');
  const [rxMedicines, setRxMedicines] = useState<PrescriptionMedicine[]>([]);
  const [rxError, setRxError] = useState<string>('');

  // Helper states for adding a medicine to prescription
  const [medSearch, setMedSearch] = useState<string>('');
  const [medDosage, setMedDosage] = useState<string>('1 teaspoon (3g)');
  const [medTiming, setMedTiming] = useState<PrescriptionMedicine['timing']>('Morning & Night');
  const [medFood, setMedFood] = useState<PrescriptionMedicine['foodRelation']>('After Food');
  const [medAnupanam, setMedAnupanam] = useState<string>('Warm Water');
  const [medDuration, setMedDuration] = useState<string>('15 days');
  const [medInstructions, setMedInstructions] = useState<string>('');

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.mobile.includes(q);
  });

  const patientPrescriptions = selectedPatient
    ? prescriptions
        .filter((rx) => rx.patientId === selectedPatient.id)
        .sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate))
    : [];

  const patientBills = selectedPatient
    ? bills
        .filter((b) => b.patientId === selectedPatient.id || b.patientMobile === selectedPatient.mobile)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({ id: '', name: '', mobile: '', address: '', notes: '' });
    setPatientFormError('');
    setShowPatientModal(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setModalMode('EDIT');
    setFormData({
      id: p.id,
      name: p.name,
      mobile: p.mobile,
      address: p.address || '',
      notes: p.notes || '',
    });
    setPatientFormError('');
    setShowPatientModal(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientFormError('');

    if (!formData.name.trim()) {
      setPatientFormError('Patient name is required.');
      return;
    }
    if (!/^\d{10}$/.test(formData.mobile.trim())) {
      setPatientFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    const duplicate = patients.find(
      (p) => p.mobile === formData.mobile.trim() && p.id !== formData.id
    );
    if (duplicate) {
      setPatientFormError(`Mobile ${formData.mobile} is already registered to "${duplicate.name}".`);
      return;
    }

    const allPats = storage.getPatients();
    let updated: Patient[];

    if (modalMode === 'CREATE') {
      const newPat: Patient = {
        id: `pat_${Date.now()}`,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [newPat, ...allPats];
      setSelectedPatient(newPat);
    } else {
      updated = allPats.map((p) =>
        p.id === formData.id
          ? {
              ...p,
              name: formData.name.trim(),
              mobile: formData.mobile.trim(),
              address: formData.address.trim(),
              notes: formData.notes.trim(),
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      const updatedSel = updated.find((p) => p.id === formData.id);
      if (updatedSel) setSelectedPatient(updatedSel);
    }

    storage.savePatients(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      modalMode === 'CREATE' ? 'PATIENT_CREATED' : 'PATIENT_UPDATED',
      `Patient "${formData.name.trim()}" (${formData.mobile.trim()}) ${
        modalMode === 'CREATE' ? 'registered' : 'updated'
      }.`
    );

    onPatientUpdated(updated);
    setShowPatientModal(false);
  };

  const handleAddMedicineToRx = (prod: Product) => {
    const newMed: PrescriptionMedicine = {
      id: `rxm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productCode: prod.productCode,
      medicineName: prod.name,
      dosage: medDosage,
      timing: medTiming,
      foodRelation: medFood,
      anupanam: medAnupanam,
      duration: medDuration,
      instructions: medInstructions,
    };
    setRxMedicines([...rxMedicines, newMed]);
    setMedSearch('');
    setMedInstructions('');
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setRxError('');

    if (!selectedPatient) return;
    if (rxMedicines.length === 0) {
      setRxError('A prescription must contain at least one medicine.');
      return;
    }

    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: rxDoctorName.trim(),
      prescriptionDate: rxDate,
      medicines: [...rxMedicines],
      notes: rxNotes.trim(),
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
    };

    const allRx = storage.getPrescriptions();
    const updated = [newRx, ...allRx];
    storage.savePrescriptions(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'PRESCRIPTION_CREATED',
      `Prescription recorded for patient "${selectedPatient.name}" by Dr. ${rxDoctorName}.`
    );

    onPrescriptionAdded(newRx);
    setShowRxModal(false);
    setRxMedicines([]);
    setRxNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Clinical Registry & Consultations
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Patients on File: {patients.length}</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Patient Dossiers & Prescription Management
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#d6a84f]" />
          <span>+ Register New Patient</span>
        </button>
      </div>

      {/* Two-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Search & Directory (4 cols) */}
        <div className="lg:col-span-4 bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or 10-digit mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
            />
          </div>

          <div className="divide-y divide-[#ded8cb] max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#697067]">
                No patients found matching "{searchQuery}".
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const rxCount = prescriptions.filter((rx) => rx.patientId === p.id).length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full text-left p-3 rounded-lg my-1 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#16382b] text-[#ffffff] shadow-2xs font-semibold'
                        : 'hover:bg-[#faf7f2] text-[#1f2723]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{p.name}</span>
                      <div className={`text-[11px] font-mono mt-0.5 flex items-center gap-1.5 ${
                        isSelected ? 'text-[#d6a84f]' : 'text-[#697067]'
                      }`}>
                        <Phone className="w-3 h-3" />
                        <span>{p.mobile}</span>
                      </div>
                    </div>
                    {rxCount > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-[#2b5542] text-[#ffffff] border-[#4f7358]'
                          : 'bg-[#f0eae1] text-[#16382b] border-[#ded8cb]'
                      }`}>
                        {rxCount} Rx
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Patient Clinical Dossier & Rx (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPatient ? (
            <>
              {/* Patient Identity Dossier Card */}
              <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#ded8cb]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif-clinical text-xl font-bold text-[#16382b]">
                        {selectedPatient.name}
                      </h2>
                      <span className="font-mono text-[10px] text-[#697067] bg-[#f0eae1] px-2 py-0.5 rounded border border-[#ded8cb]">
                        ID: {selectedPatient.id.slice(-6)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#697067] mt-1.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-[#16382b]" />
                        <strong>{selectedPatient.mobile}</strong>
                      </span>
                      {selectedPatient.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#6b5239]" />
                          <span>{selectedPatient.address}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selectedPatient)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1f2723] bg-[#faf7f2] hover:bg-[#f0eae1] rounded-lg border border-[#ded8cb]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#697067]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDirectBillPatient(selectedPatient)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#d6a84f]" />
                      <span>⚡ Dispense at Counter</span>
                    </button>
                  </div>
                </div>

                {selectedPatient.notes && (
                  <div className="p-3 bg-[#faf7f2] rounded-lg border border-[#ded8cb] text-xs">
                    <strong className="text-[#16382b] block mb-0.5">Clinical & Dosha Assessment:</strong>
                    <p className="text-[#697067] leading-relaxed">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>

              {/* Patient Prescriptions Section */}
              <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#16382b]" />
                    <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                      Physician Prescriptions ({patientPrescriptions.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRxMedicines([]);
                      setRxNotes('');
                      setRxError('');
                      setShowRxModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#16382b] bg-[#f0eae1] hover:bg-[#ded8cb] rounded-lg border border-[#ded8cb] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Prescribe Formulations</span>
                  </button>
                </div>

                {patientPrescriptions.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#697067] bg-[#faf7f2] rounded-lg border border-dashed border-[#ded8cb]">
                    <ClipboardList className="w-8 h-8 text-[#9bb09f] mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-[#1f2723]">No clinical prescriptions recorded yet</p>
                    <p className="text-[11px] mt-0.5">Click "+ Prescribe Formulations" to record classical churnams, thailams and dosage.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-4 bg-[#faf7f2] rounded-xl border border-[#ded8cb] space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ded8cb]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#b88628]" />
                            <span className="font-mono font-bold text-[#16382b]">
                              {rx.prescriptionDate}
                            </span>
                            <span className="text-[#697067]">· Doctor: {rx.doctorName}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDirectBillPatient(selectedPatient, rx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded shadow-2xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-[#d6a84f]" />
                            <span>Dispense Rx at Counter</span>
                          </button>
                        </div>

                        {/* Medicine List */}
                        <div className="space-y-2">
                          {rx.medicines.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3 bg-[#ffffff] rounded-lg border border-[#ded8cb] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-[#1f2723] block text-sm">
                                  {med.medicineName}
                                </span>
                                <div className="text-[11px] text-[#697067] flex flex-wrap gap-2 mt-1">
                                  <span><strong>Dose:</strong> {med.dosage}</span>
                                  <span>·</span>
                                  <span><strong>Timing:</strong> {med.timing}</span>
                                  <span>·</span>
                                  <span>{med.foodRelation}</span>
                                  {med.anupanam && (
                                    <span className="text-[#6b5239] font-semibold">
                                      · Adjuvant (Anupanam): {med.anupanam}
                                    </span>
                                  )}
                                </div>
                                {med.instructions && (
                                  <div className="text-[11px] text-[#697067] italic mt-1 bg-[#faf7f2] p-1.5 rounded">
                                    "{med.instructions}"
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] font-mono font-bold text-[#16382b] bg-[#f0eae1] px-2 py-1 rounded border border-[#ded8cb] self-start sm:self-auto">
                                {med.duration}
                              </span>
                            </div>
                          ))}
                        </div>

                        {rx.notes && (
                          <div className="text-[11px] text-[#1f2723] bg-[#ffffff] p-3 rounded-lg border border-[#ded8cb]">
                            <strong className="text-[#6b5239]">Physician Dietary Guidance (Pathyam): </strong> {rx.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Past Dispensary Bills */}
              <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
                  <div className="flex items-center gap-2">
                    <FileClock className="w-4 h-4 text-[#16382b]" />
                    <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                      Dispensary Counter History ({patientBills.length})
                    </h3>
                  </div>
                </div>

                {patientBills.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#697067] bg-[#faf7f2] rounded-lg">
                    No past bills on file for this patient.
                  </div>
                ) : (
                  <div className="divide-y divide-[#ded8cb]">
                    {patientBills.map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-[#faf7f2] px-2 rounded transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#16382b]">
                              {b.billNumber}
                            </span>
                            <span className="font-mono text-[#697067]">{b.date}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#f0eae1] rounded text-[#1f2723] font-mono uppercase font-bold">
                              {b.paymentMode}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#697067] mt-0.5">
                            {b.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-[#16382b] tabular-nums block">
                            {formatINR(b.grandTotal)}
                          </span>
                          <span className="text-[10px] text-[#4f7358]">Finalized</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-[#697067] bg-[#ffffff] rounded-xl border border-[#ded8cb]">
              Select a patient from the directory on the left to review their clinical dossier and prescriptions.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                {modalMode === 'CREATE' ? 'Register New Patient' : 'Edit Patient Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {patientFormError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {patientFormError}
              </div>
            )}

            <form onSubmit={handleSavePatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Full Name <span className="text-[#ab4d38]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Ramanathan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Mobile Number (10 Digits) <span className="text-[#ab4d38]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9840123456"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1f2723] block mb-1">Address / Town</label>
                <input
                  type="text"
                  placeholder="e.g. East Car Street, Tirunelveli"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1f2723] block mb-1">Clinical Notes & Pulse History</label>
                <textarea
                  rows={3}
                  placeholder="Dosha characteristics, chronic ailments, allergies..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs"
                >
                  {modalMode === 'CREATE' ? 'Register Patient' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {showRxModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#ffffff] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <div>
                <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                  Prescribe Clinical Formulations for {selectedPatient.name}
                </h3>
                <p className="text-[11px] text-[#697067]">
                  Record doctor diagnosis, classical Siddha/Ayurvedic medicines, dosage & Anupanam
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {rxError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {rxError}
              </div>
            )}

            <form onSubmit={handleSavePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Physician Name</label>
                  <input
                    type="text"
                    required
                    value={rxDoctorName}
                    onChange={(e) => setRxDoctorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Consultation Date</label>
                  <input
                    type="date"
                    required
                    value={rxDate}
                    onChange={(e) => setRxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                  />
                </div>
              </div>

              {/* Medicine Add Sub-panel */}
              <div className="p-4 bg-[#faf7f2] rounded-xl border border-[#ded8cb] space-y-3">
                <span className="font-serif-clinical text-xs font-bold text-[#16382b] block">
                  Select Formulation from Dispensary Formulary
                </span>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search medicine by name or product code..."
                    value={medSearch}
                    onChange={(e) => setMedSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#ffffff] border border-[#ded8cb] rounded-lg text-xs"
                  />
                </div>

                {medSearch.trim() && (
                  <div className="border border-[#ded8cb] rounded-lg divide-y divide-[#ded8cb] max-h-36 overflow-y-auto bg-[#ffffff]">
                    {products
                      .filter((p) => p.active)
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(medSearch.toLowerCase()) ||
                          p.productCode.toLowerCase().includes(medSearch.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleAddMedicineToRx(prod)}
                          className="w-full text-left p-2 hover:bg-[#f0eae1] flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#16382b] mr-2">
                              {prod.productCode}
                            </span>
                            <span className="font-bold text-[#1f2723]">{prod.name}</span>
                            <span className="text-[10px] text-[#697067] ml-2">({prod.category})</span>
                          </div>
                          <span className="text-xs font-bold text-[#16382b]">+ Add</span>
                        </button>
                      ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-[#697067] block mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="e.g. 1 tsp (3g)"
                      className="w-full px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#697067] block mb-0.5">Timing</label>
                    <select
                      value={medTiming}
                      onChange={(e) => setMedTiming(e.target.value as any)}
                      className="w-full px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded text-xs"
                    >
                      <option value="Morning & Night">Morning & Night</option>
                      <option value="Morning Only">Morning Only</option>
                      <option value="Night Only">Night Only</option>
                      <option value="Three Times (M-N-N)">Three Times (M-N-N)</option>
                      <option value="As Needed (SOS)">As Needed (SOS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#697067] block mb-0.5">Food Relation</label>
                    <select
                      value={medFood}
                      onChange={(e) => setMedFood(e.target.value as any)}
                      className="w-full px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded text-xs"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#697067] block mb-0.5">Adjuvant (Anupanam)</label>
                    <input
                      type="text"
                      value={medAnupanam}
                      onChange={(e) => setMedAnupanam(e.target.value)}
                      placeholder="Warm Water, Honey, Milk"
                      className="w-full px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Medicines added so far */}
              {rxMedicines.length > 0 && (
                <div className="space-y-1.5 border border-[#ded8cb] rounded-xl p-3 bg-[#ffffff]">
                  <span className="font-bold text-[#16382b] text-[11px] block mb-1">
                    Formulations in this Prescription ({rxMedicines.length}):
                  </span>
                  {rxMedicines.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#faf7f2] rounded border border-[#ded8cb] text-xs">
                      <div>
                        <strong className="text-[#1f2723]">{m.medicineName}</strong>
                        <span className="text-[11px] text-[#697067] ml-2">
                          {m.dosage} · {m.timing} · {m.foodRelation} {m.anupanam && `(with ${m.anupanam})`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRxMedicines(rxMedicines.filter((_, i) => i !== idx))}
                        className="text-[#ab4d38] font-bold text-xs p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Pathyam (Dietary & Lifestyle Advice)
                </label>
                <textarea
                  rows={2}
                  placeholder="Avoid tamarind, cold foods, excess spice; take warm soups..."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rxMedicines.length === 0}
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-2xs ${
                    rxMedicines.length === 0
                      ? 'bg-[#ded8cb] text-[#697067] cursor-not-allowed'
                      : 'bg-[#16382b] hover:bg-[#2b5542] text-[#ffffff]'
                  }`}
                >
                  Save & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

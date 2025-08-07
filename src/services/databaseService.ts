import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface untuk RT
export interface RT {
  id?: string;
  rtNumber: string;
  rtLeader: string;
  phone: string;
  address: string;
  totalMembers: number;
  activeMembers: number;
  totalSavings: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Interface untuk Member
export interface Member {
  id?: string;
  rtNumber: string;
  memberNumber: string;
  fullName: string;
  phone: string;
  address: string;
  joinDate: Date;
  totalSavings: number;
  totalWithdrawals: number;
  lastTransaction?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk Transaksi Setoran Sampah
export interface WasteDeposit {
  id?: string;
  memberNumber: string;
  rtNumber: string;
  depositDate: Date;
  wasteTypes: {
    type: string;
    weight: number;
    pricePerKg: number;
    total: number;
  }[];
  totalWeight: number;
  totalAmount: number;
  notes?: string;
  processedBy: string;
  createdAt: Date;
}

// Interface untuk Transaksi Tabungan
export interface SavingsTransaction {
  id?: string;
  memberNumber: string;
  rtNumber: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: Date;
  description: string;
  processedBy: string;
  relatedWasteDepositId?: string;
  createdAt: Date;
}

class DatabaseService {
  // === RT Management ===
  async createRT(rtData: Omit<RT, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'rts'), {
        ...rtData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating RT:', error);
      throw new Error('Gagal membuat data RT');
    }
  }

  async updateRT(rtId: string, rtData: Partial<RT>): Promise<void> {
    try {
      await updateDoc(doc(db, 'rts', rtId), {
        ...rtData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating RT:', error);
      throw new Error('Gagal mengupdate data RT');
    }
  }

  async deleteRT(rtId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'rts', rtId));
    } catch (error) {
      console.error('Error deleting RT:', error);
      throw new Error('Gagal menghapus data RT');
    }
  }

  async getRT(rtId: string): Promise<RT | null> {
    try {
      const rtDoc = await getDoc(doc(db, 'rts', rtId));
      if (rtDoc.exists()) {
        const data = rtDoc.data();
        return {
          id: rtDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as RT;
      }
      return null;
    } catch (error) {
      console.error('Error getting RT:', error);
      throw new Error('Gagal mengambil data RT');
    }
  }

  async getAllRTs(): Promise<RT[]> {
    try {
      const q = query(collection(db, 'rts'), orderBy('rtNumber'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as RT[];
    } catch (error) {
      console.error('Error getting RTs:', error);
      throw new Error('Gagal mengambil data RT');
    }
  }

  async getRTByNumber(rtNumber: string): Promise<RT | null> {
    try {
      const q = query(
        collection(db, 'rts'),
        where('rtNumber', '==', rtNumber),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as RT;
      }
      return null;
    } catch (error) {
      console.error('Error getting RT by number:', error);
      throw new Error('Gagal mengambil data RT');
    }
  }

  // === Member Management ===
  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'members'), {
        ...memberData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update total members di RT
      await this.updateRTMemberCount(memberData.rtNumber);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('Gagal membuat data anggota');
    }
  }

  async updateMember(memberId: string, memberData: Partial<Member>): Promise<void> {
    try {
      await updateDoc(doc(db, 'members', memberId), {
        ...memberData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Gagal mengupdate data anggota');
    }
  }

  async getMembersByRT(rtNumber: string): Promise<Member[]> {
    try {
      const q = query(
        collection(db, 'members'),
        where('rtNumber', '==', rtNumber),
        orderBy('memberNumber')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate?.toDate(),
        lastTransaction: doc.data().lastTransaction?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Member[];
    } catch (error) {
      console.error('Error getting members:', error);
      throw new Error('Gagal mengambil data anggota');
    }
  }

  async getMember(memberNumber: string): Promise<Member | null> {
    try {
      const q = query(
        collection(db, 'members'),
        where('memberNumber', '==', memberNumber),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinDate: data.joinDate?.toDate(),
          lastTransaction: data.lastTransaction?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Member;
      }
      return null;
    } catch (error) {
      console.error('Error getting member:', error);
      throw new Error('Gagal mengambil data anggota');
    }
  }

  async createOrGetCollectiveMember(rtNumber: string): Promise<Member> {
    const memberNumber = `RT${rtNumber}-COLLECTIVE`;
    
    try {
      // Try to get existing collective member
      let member = await this.getMember(memberNumber);
      
      if (!member) {
        // Create collective member for RT
        const memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
          rtNumber: rtNumber,
          memberNumber: memberNumber,
          fullName: `Kolektif RT ${rtNumber}`,
          phone: "-",
          address: `Alamat RT ${rtNumber}`,
          joinDate: new Date(),
          totalSavings: 0,
          totalWithdrawals: 0,
          isActive: true
        };
        
        const memberId = await this.createMember(memberData);
        member = await this.getMember(memberNumber);
      }
      
      return member!;
    } catch (error) {
      console.error('Error creating/getting collective member:', error);
      throw new Error('Gagal membuat/mengambil member kolektif RT');
    }
  }

  // === Waste Deposit Management ===
  async createWasteDeposit(depositData: Omit<WasteDeposit, 'id' | 'createdAt'>): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Create or get collective member for RT
      await this.createOrGetCollectiveMember(depositData.rtNumber);

      // Create waste deposit
      const depositRef = doc(collection(db, 'wasteDeposits'));
      batch.set(depositRef, {
        ...depositData,
        createdAt: new Date()
      });

      // Create savings transaction
      const savingsRef = doc(collection(db, 'savingsTransactions'));
      batch.set(savingsRef, {
        memberNumber: depositData.memberNumber,
        rtNumber: depositData.rtNumber,
        type: 'deposit',
        amount: depositData.totalAmount,
        date: depositData.depositDate,
        description: `Setoran sampah - ${depositData.totalWeight}kg`,
        processedBy: depositData.processedBy,
        relatedWasteDepositId: depositRef.id,
        createdAt: new Date()
      });

      // Update member savings
      const member = await this.getMember(depositData.memberNumber);
      if (member && member.id) {
        const memberRef = doc(db, 'members', member.id);
        batch.update(memberRef, {
          totalSavings: increment(depositData.totalAmount),
          lastTransaction: new Date(),
          updatedAt: new Date()
        });
      }

      // Update RT total savings
      const rt = await this.getRTByNumber(depositData.rtNumber);
      if (rt && rt.id) {
        const rtRef = doc(db, 'rts', rt.id);
        batch.update(rtRef, {
          totalSavings: increment(depositData.totalAmount),
          updatedAt: new Date()
        });
      }

      await batch.commit();
      return depositRef.id;
    } catch (error) {
      console.error('Error creating waste deposit:', error);
      throw new Error('Gagal mencatat setoran sampah');
    }
  }

  async getWasteDepositsByMember(memberNumber: string, limitCount = 10): Promise<WasteDeposit[]> {
    try {
      // Simplified query - remove orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'wasteDeposits'),
        where('memberNumber', '==', memberNumber),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const deposits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        depositDate: doc.data().depositDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as WasteDeposit[];
      
      // Sort in JavaScript instead of Firestore
      return deposits.sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());
    } catch (error) {
      console.error('Error getting waste deposits:', error);
      throw new Error('Gagal mengambil data setoran sampah');
    }
  }

  async getWasteDepositsByRT(rtNumber: string, limitCount = 20): Promise<WasteDeposit[]> {
    try {
      // Simplified query - remove orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'wasteDeposits'),
        where('rtNumber', '==', rtNumber),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const deposits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        depositDate: doc.data().depositDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as WasteDeposit[];
      
      // Sort in JavaScript instead of Firestore
      return deposits.sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());
    } catch (error) {
      console.error('Error getting waste deposits:', error);
      throw new Error('Gagal mengambil data setoran sampah');
    }
  }

  async getAllWasteDeposits(limitCount = 50): Promise<WasteDeposit[]> {
    try {
      // Simple query without filters to avoid index requirements
      const q = query(
        collection(db, 'wasteDeposits'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const deposits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        depositDate: doc.data().depositDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as WasteDeposit[];
      
      // Sort in JavaScript instead of Firestore
      return deposits.sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());
    } catch (error) {
      console.error('Error getting all waste deposits:', error);
      throw new Error('Gagal mengambil semua data setoran sampah');
    }
  }

  // === Savings Transaction Management ===
  async createWithdrawal(
    memberNumber: string,
    amount: number,
    description: string,
    processedBy: string
  ): Promise<string> {
    try {
      const member = await this.getMember(memberNumber);
      if (!member) {
        throw new Error('Anggota tidak ditemukan');
      }

      if (member.totalSavings < amount) {
        throw new Error('Saldo tidak mencukupi');
      }

      const batch = writeBatch(db);

      // Create withdrawal transaction
      const transactionRef = doc(collection(db, 'savingsTransactions'));
      batch.set(transactionRef, {
        memberNumber,
        rtNumber: member.rtNumber,
        type: 'withdrawal',
        amount,
        date: new Date(),
        description,
        processedBy,
        createdAt: new Date()
      });

      // Update member savings
      if (member.id) {
        const memberRef = doc(db, 'members', member.id);
        batch.update(memberRef, {
          totalSavings: increment(-amount),
          totalWithdrawals: increment(amount),
          lastTransaction: new Date(),
          updatedAt: new Date()
        });
      }

      await batch.commit();
      return transactionRef.id;
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal melakukan penarikan');
    }
  }

  async getSavingsTransactions(memberNumber: string, limitCount = 20): Promise<SavingsTransaction[]> {
    try {
      const q = query(
        collection(db, 'savingsTransactions'),
        where('memberNumber', '==', memberNumber),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as SavingsTransaction[];
    } catch (error) {
      console.error('Error getting savings transactions:', error);
      throw new Error('Gagal mengambil data transaksi tabungan');
    }
  }

  async getAllSavingsTransactions(limitCount = 100): Promise<SavingsTransaction[]> {
    try {
      const q = query(
        collection(db, 'savingsTransactions'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as SavingsTransaction[];
      
      // Sort by date descending
      return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting all savings transactions:', error);
      throw new Error('Gagal mengambil semua data transaksi tabungan');
    }
  }

  async getSavingsTransactionsByRT(rtNumber: string, limitCount = 50): Promise<SavingsTransaction[]> {
    try {
      const q = query(
        collection(db, 'savingsTransactions'),
        where('rtNumber', '==', rtNumber),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as SavingsTransaction[];
      
      // Sort by date descending
      return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting RT savings transactions:', error);
      throw new Error('Gagal mengambil data transaksi tabungan RT');
    }
  }

  // === Utility Functions ===
  private async updateRTMemberCount(rtNumber: string): Promise<void> {
    try {
      const membersQuery = query(
        collection(db, 'members'),
        where('rtNumber', '==', rtNumber),
        where('isActive', '==', true)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const activeMembers = membersSnapshot.size;

      // Find RT document
      const rtQuery = query(
        collection(db, 'rts'),
        where('rtNumber', '==', rtNumber),
        limit(1)
      );
      const rtSnapshot = await getDocs(rtQuery);
      
      if (!rtSnapshot.empty) {
        const rtDoc = rtSnapshot.docs[0];
        await updateDoc(rtDoc.ref, {
          activeMembers,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating RT member count:', error);
    }
  }

  // Generate member number
  async generateMemberNumber(rtNumber: string): Promise<string> {
    try {
      const membersQuery = query(
        collection(db, 'members'),
        where('rtNumber', '==', rtNumber),
        orderBy('memberNumber', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(membersQuery);
      
      let nextNumber = 1;
      if (!snapshot.empty) {
        const lastMember = snapshot.docs[0].data();
        const lastNumber = parseInt(lastMember.memberNumber.split('-')[1] || '0');
        nextNumber = lastNumber + 1;
      }
      
      return `${rtNumber}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating member number:', error);
      throw new Error('Gagal generate nomor anggota');
    }
  }
}

export const databaseService = new DatabaseService();

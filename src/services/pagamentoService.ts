import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Pagamento, ConfiguracaoPagamento } from '../types/pagamentos';
import { uploadToCloudinary } from '../utils/cloudinary';

export async function buscarPagamentosPorMorador(condominioId: string, moradorId: string) {
  const pagamentosRef = collection(db, 'condominios', condominioId, 'pagamentos');
  const q = query(
    pagamentosRef,
    where('moradorId', '==', moradorId),
    orderBy('dataPagamento', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Pagamento[];
}

export async function registrarPagamento(
  condominioId: string,
  pagamento: Omit<Pagamento, 'id'>,
  comprovante?: File
) {
  let comprovanteUrl = '';

  if (comprovante) {
    comprovanteUrl = await uploadToCloudinary(comprovante, {
      folder: `condominios/${condominioId}/comprovantes`,
      resource_type: 'auto'
    });
  }

  const pagamentosRef = collection(db, 'condominios', condominioId, 'pagamentos');
  const docRef = await addDoc(pagamentosRef, {
    ...pagamento,
    comprovanteUrl,
    dataPagamento: Timestamp.now()
  });

  return {
    id: docRef.id,
    ...pagamento,
    comprovanteUrl
  };
}

export async function atualizarStatusPagamento(
  condominioId: string,
  pagamentoId: string,
  status: Pagamento['status']
) {
  const pagamentoRef = doc(db, 'condominios', condominioId, 'pagamentos', pagamentoId);
  await updateDoc(pagamentoRef, { status });
}

export async function buscarConfiguracaoPagamento(condominioId: string) {
  const configRef = doc(db, 'condominios', condominioId, 'configuracoes', 'pagamento');
  const snapshot = await getDoc(configRef);

  if (!snapshot.exists()) {
    return {
      valorPadrao: 0,
      diaVencimento: 10
    } as ConfiguracaoPagamento;
  }

  return snapshot.data() as ConfiguracaoPagamento;
}

export async function salvarConfiguracaoPagamento(
  condominioId: string,
  config: ConfiguracaoPagamento
) {
  const configRef = doc(db, 'condominios', condominioId, 'configuracoes', 'pagamento');
  const configData = {
    valorPadrao: config.valorPadrao,
    diaVencimento: config.diaVencimento,
    pixKey: config.pixKey,
    pixType: config.pixType,
    webhookUrl: config.webhookUrl
  };
  await setDoc(configRef, configData);
}

export async function gerarCobrancasMensais(condominioId: string) {
  const config = await buscarConfiguracaoPagamento(condominioId);
  const moradoresRef = collection(db, 'condominios', condominioId, 'moradores');
  const moradoresSnapshot = await getDocs(moradoresRef);
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  const dataVencimento = new Date(ano, mes - 1, config.diaVencimento);

  const cobrancas = moradoresSnapshot.docs.map(async (moradorDoc) => {
    const pagamentosRef = collection(db, 'condominios', condominioId, 'pagamentos');
    const pagamentoExistente = await getDocs(
      query(
        pagamentosRef,
        where('moradorId', '==', moradorDoc.id),
        where('mes', '==', mes),
        where('ano', '==', ano)
      )
    );

    if (pagamentoExistente.empty) {
      return addDoc(pagamentosRef, {
        moradorId: moradorDoc.id,
        valor: config.valorPadrao,
        mes,
        ano,
        status: 'pendente',
        dataVencimento: Timestamp.fromDate(dataVencimento),
        dataPagamento: null
      });
    }
  });

  await Promise.all(cobrancas);
}

export async function verificarPagamentosAtrasados(condominioId: string) {
  const pagamentosRef = collection(db, 'condominios', condominioId, 'pagamentos');
  const hoje = Timestamp.now();

  const pagamentosAtrasados = await getDocs(
    query(
      pagamentosRef,
      where('status', '==', 'pendente'),
      where('dataVencimento', '<', hoje)
    )
  );

  const atualizacoes = pagamentosAtrasados.docs.map(doc =>
    updateDoc(doc.ref, { status: 'atrasado' })
  );

  await Promise.all(atualizacoes);
}
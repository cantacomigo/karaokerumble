import { Link } from 'react-router-dom';

export default function Checkout() {
    return (
        <div className="flex-1 flex items-center justify-center py-12 px-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Payment QR Section */}
                <div className="flex flex-col items-center gap-6">
                    <div className="w-full text-center md:text-left mb-2">
                        <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-slate-100">Pagamento via PIX</h1>
                        <p className="text-slate-500">Finalize sua compra escaneando o código abaixo.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center w-full max-w-xs md:max-w-sm shadow-xl shadow-primary/5 ring-1 ring-primary/10">
                        <div className="bg-slate-100 dark:bg-white p-4 rounded-xl mb-4 w-full aspect-square flex items-center justify-center border-2 border-slate-200 dark:border-transparent cursor-pointer hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined text-9xl text-slate-900">qr_code_2</span>
                        </div>
                        <button className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md">
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                            Copiar Código PIX
                        </button>
                    </div>

                    <div className="w-full space-y-4 bg-primary/5 p-6 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">smartphone</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">1. Acesse o app do seu banco</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">2. Escolha pagar via PIX</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">3. Escaneie o código</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary & Status */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-primary/10 backdrop-blur-sm shadow-sm">
                        <h2 className="text-xl font-bold mb-6 border-b border-primary/10 pb-4 text-slate-900 dark:text-slate-100">Resumo do Pedido</h2>

                        <div className="flex gap-4 mb-6">
                            <div className="size-20 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 shadow">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I"
                                    alt="Item image"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Bohemian Rhapsody</h3>
                                <p className="text-sm text-slate-500">Queen (Playback Profissional)</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6 pt-4 border-t border-primary/5">
                            <div className="size-20 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 shadow">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I"
                                    alt="Item image"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Evidências</h3>
                                <p className="text-sm text-slate-500">Chitãozinho & Xororó</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Subtotal (2 itens)</span>
                                <span>R$ 34,80</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Taxas</span>
                                <span>R$ 0,00</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 dark:text-slate-100 pt-3 border-t border-primary/10">
                                <span>Total a pagar</span>
                                <span className="text-primary">R$ 34,80</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-amber-500 text-sm font-bold bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-full ring-1 ring-amber-500/20">
                                <span className="material-symbols-outlined animate-pulse">timer</span>
                                O código expira em <span className="font-mono">14:59</span>
                            </div>
                            <button
                                className="w-full py-4 px-6 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed rounded-xl font-black text-lg flex items-center justify-center gap-2"
                                disabled
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                Confirmar Pagamento
                            </button>
                            <p className="text-xs text-slate-500 text-center animate-pulse">
                                Aguardando detecção automática do pagamento...
                            </p>
                        </div>
                    </div>

                    <Link to="/cart" className="text-center text-sm text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para o carrinho
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-primary/10 bg-background-light dark:bg-background-dark py-12">
            <div className="mx-auto max-w-[1200px] px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-2xl">mic_external_on</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Karaoke Studio</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            A fonte premium mundial para faixas de karaokê profissionais e playbacks de alta performance.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Loja</h5>
                        <ul className="text-sm text-slate-500 space-y-2">
                            <li><a href="#" className="hover:text-primary transition-colors">Últimas Faixas</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pacotes Populares</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Playbacks Personalizados</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cartões Presente</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Suporte</h5>
                        <ul className="text-sm text-slate-500 space-y-2">
                            <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contatos</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Política de Reembolso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Licenciamento</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Assine Nossa Newsletter</h5>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="newsletter-email" className="sr-only">Assine nossa Newsletter</label>
                            <div className="flex gap-2">
                                <input
                                    id="newsletter-email"
                                    name="newsletter-email"
                                    type="email"
                                    className="w-full rounded-lg border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:ring-2 focus:ring-primary dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                                    placeholder="Seu endereço de e-mail"
                                />
                                <button className="rounded-lg bg-primary px-4 py-2 text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
                                    Assinar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-primary/10 text-center text-sm text-slate-500">
                    © 2026 Karaoke Studio Playbacks. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}

// Lightweight, dependency-free i18n. Covers the site's static chrome text
// (nav, hero, common buttons/labels) — NOT dynamic content (listings,
// reviews, chat messages), since that comes from Firestore/RealtyAPI and
// would need either pre-translation by whoever enters it, or a paid
// translation API called per-string. Adding a language: add a key to
// TRANSLATIONS below, add it to the switcher list, and tag more elements
// with data-i18n="key" the same way the existing ones are tagged.
const TRANSLATIONS = {
  es: {
    "nav.home": "Inicio", "nav.listings": "Propiedades", "nav.agents": "Agentes",
    "nav.history": "Nuestra Historia", "nav.reviews": "Reseñas", "nav.contact": "Contacto",
    "hero.eyebrow": "Comprar · Alquilar · Propiedades Verificadas",
    "hero.heading": "Encuentra un hogar en el que puedas confiar.",
    "hero.copy": "Cada propiedad se verifica contra su título antes de publicarse. Explora, agenda una visita y paga de forma segura en USD o BTC.",
    "hero.search_placeholder": "Busca por zona, ej. Austin, Denver…",
    "hero.search_btn": "Buscar", "btn.view_all": "Ver todo →", "footer.copyright_suffix": "Bienes Raíces",
    "common.search": "Buscar", "common.for_sale": "En venta", "common.for_rent": "En alquiler",
    "common.sale_or_rent": "Venta o alquiler", "common.all": "Todos", "common.min_price": "Mín $", "common.max_price": "Máx $",
    "common.save": "Guardar", "common.sign_in": "Iniciar sesión", "common.sign_out": "Cerrar sesión",
    "common.create_account": "Crear cuenta", "common.email": "Correo electrónico", "common.password": "Contraseña",
    "common.full_name": "Nombre completo", "common.phone": "Teléfono", "common.message": "Mensaje",
    "common.send": "Enviar", "common.close": "Cerrar", "common.back_home": "Volver al inicio",
    "listings.eyebrow": "Registro completo", "listings.heading": "Todas las propiedades registradas",
    "listings.search_placeholder": "Ciudad, código postal, pueblo o barrio…",
    "listings.our_eyebrow": "Nuestras propiedades", "listings.our_heading": "Propiedades verificadas, propias de la agencia",
    "listings.nationwide_eyebrow": "Búsqueda nacional",
    "agents.eyebrow": "El equipo", "agents.heading": "Agentes registrados",
    "about.eyebrow": "Nuestra historia", "about.heading": "Dos décadas manteniendo los registros en orden.",
    "reviews.eyebrow": "Solo compradores verificados", "reviews.heading": "Lo que dicen los compradores",
    "contact.eyebrow": "Ponte en contacto", "contact.heading": "Habla con la oficina",
    "contact.office": "Oficina", "contact.hours": "Horario",
    "dashboard.heading": "Propiedades guardadas",
    "login.heading": "Iniciar sesión", "login.new_here": "¿Nuevo aquí?",
    "signup.heading": "Crear cuenta", "signup.already": "¿Ya estás registrado?",
    "listing.book_viewing": "Reservar una visita", "listing.pay_btc": "Pagar la tarifa de reserva en BTC",
    "listing.message_agent": "Enviar mensaje al agente"
  },
  pt: {
    "nav.home": "Início", "nav.listings": "Imóveis", "nav.agents": "Agentes",
    "nav.history": "Nossa História", "nav.reviews": "Avaliações", "nav.contact": "Contato",
    "hero.eyebrow": "Comprar · Alugar · Imóveis Verificados",
    "hero.heading": "Encontre um lar em que você pode confiar.",
    "hero.copy": "Cada imóvel é verificado em relação ao título antes de ser publicado. Explore, agende uma visita e pague com segurança em USD ou BTC.",
    "hero.search_placeholder": "Busque por cidade ou bairro, ex. Austin, Denver…",
    "hero.search_btn": "Buscar", "btn.view_all": "Ver tudo →", "footer.copyright_suffix": "Imóveis",
    "common.search": "Buscar", "common.for_sale": "À venda", "common.for_rent": "Para alugar",
    "common.sale_or_rent": "Venda ou aluguel", "common.all": "Todos", "common.min_price": "Mín $", "common.max_price": "Máx $",
    "common.save": "Salvar", "common.sign_in": "Entrar", "common.sign_out": "Sair",
    "common.create_account": "Criar conta", "common.email": "E-mail", "common.password": "Senha",
    "common.full_name": "Nome completo", "common.phone": "Telefone", "common.message": "Mensagem",
    "common.send": "Enviar", "common.close": "Fechar", "common.back_home": "Voltar ao início",
    "listings.eyebrow": "Registro completo", "listings.heading": "Todos os imóveis registrados",
    "listings.search_placeholder": "Cidade, CEP, vila ou bairro…",
    "listings.our_eyebrow": "Nossos imóveis", "listings.our_heading": "Imóveis verificados, próprios da agência",
    "listings.nationwide_eyebrow": "Busca nacional",
    "agents.eyebrow": "A equipe", "agents.heading": "Agentes registrados",
    "about.eyebrow": "Nossa história", "about.heading": "Duas décadas mantendo os registros em ordem.",
    "reviews.eyebrow": "Somente compradores verificados", "reviews.heading": "O que os compradores dizem",
    "contact.eyebrow": "Entre em contato", "contact.heading": "Fale com o escritório",
    "contact.office": "Escritório", "contact.hours": "Horário",
    "dashboard.heading": "Imóveis salvos",
    "login.heading": "Entrar", "login.new_here": "Novo por aqui?",
    "signup.heading": "Criar conta", "signup.already": "Já tem cadastro?",
    "listing.book_viewing": "Agendar uma visita", "listing.pay_btc": "Pagar taxa de reserva em BTC",
    "listing.message_agent": "Enviar mensagem ao agente"
  },
  fr: {
    "nav.home": "Accueil", "nav.listings": "Annonces", "nav.agents": "Agents",
    "nav.history": "Notre Histoire", "nav.reviews": "Avis", "nav.contact": "Contact",
    "hero.eyebrow": "Acheter · Louer · Biens Vérifiés",
    "hero.heading": "Trouvez un logement en qui vous pouvez avoir confiance.",
    "hero.copy": "Chaque annonce est vérifiée par rapport à son titre de propriété avant sa publication. Parcourez, réservez une visite et payez en toute sécurité en USD ou BTC.",
    "hero.search_placeholder": "Recherchez par ville ou quartier, ex. Austin, Denver…",
    "hero.search_btn": "Rechercher", "btn.view_all": "Tout voir →", "footer.copyright_suffix": "Immobilier",
    "common.search": "Rechercher", "common.for_sale": "À vendre", "common.for_rent": "À louer",
    "common.sale_or_rent": "Vente ou location", "common.all": "Tous", "common.min_price": "Min $", "common.max_price": "Max $",
    "common.save": "Enregistrer", "common.sign_in": "Se connecter", "common.sign_out": "Se déconnecter",
    "common.create_account": "Créer un compte", "common.email": "E-mail", "common.password": "Mot de passe",
    "common.full_name": "Nom complet", "common.phone": "Téléphone", "common.message": "Message",
    "common.send": "Envoyer", "common.close": "Fermer", "common.back_home": "Retour à l'accueil",
    "listings.eyebrow": "Registre complet", "listings.heading": "Tous les biens enregistrés",
    "listings.search_placeholder": "Ville, code postal, village ou quartier…",
    "listings.our_eyebrow": "Nos annonces", "listings.our_heading": "Biens vérifiés, appartenant à l'agence",
    "listings.nationwide_eyebrow": "Recherche nationale",
    "agents.eyebrow": "L'équipe", "agents.heading": "Agents enregistrés",
    "about.eyebrow": "Notre histoire", "about.heading": "Deux décennies à tenir des registres impeccables.",
    "reviews.eyebrow": "Acheteurs vérifiés uniquement", "reviews.heading": "Ce que disent les acheteurs",
    "contact.eyebrow": "Contactez-nous", "contact.heading": "Parlez à l'agence",
    "contact.office": "Bureau", "contact.hours": "Horaires",
    "dashboard.heading": "Biens sauvegardés",
    "login.heading": "Se connecter", "login.new_here": "Nouveau ici ?",
    "signup.heading": "Créer un compte", "signup.already": "Déjà inscrit ?",
    "listing.book_viewing": "Réserver une visite", "listing.pay_btc": "Payer les frais de réservation en BTC",
    "listing.message_agent": "Envoyer un message à l'agent"
  },
  de: {
    "nav.home": "Startseite", "nav.listings": "Angebote", "nav.agents": "Makler",
    "nav.history": "Unsere Geschichte", "nav.reviews": "Bewertungen", "nav.contact": "Kontakt",
    "hero.eyebrow": "Kaufen · Mieten · Geprüfte Immobilien",
    "hero.heading": "Finden Sie ein Zuhause, dem Sie vertrauen können.",
    "hero.copy": "Jedes Angebot wird vor der Veröffentlichung anhand des Grundbucheintrags geprüft. Durchsuchen, Besichtigung vereinbaren und sicher in USD oder BTC bezahlen.",
    "hero.search_placeholder": "Suche nach Stadt oder Viertel, z. B. Austin, Denver…",
    "hero.search_btn": "Suchen", "btn.view_all": "Alle ansehen →", "footer.copyright_suffix": "Immobilien",
    "common.search": "Suchen", "common.for_sale": "Zu verkaufen", "common.for_rent": "Zu vermieten",
    "common.sale_or_rent": "Kauf oder Miete", "common.all": "Alle", "common.min_price": "Min $", "common.max_price": "Max $",
    "common.save": "Speichern", "common.sign_in": "Anmelden", "common.sign_out": "Abmelden",
    "common.create_account": "Konto erstellen", "common.email": "E-Mail", "common.password": "Passwort",
    "common.full_name": "Vollständiger Name", "common.phone": "Telefon", "common.message": "Nachricht",
    "common.send": "Senden", "common.close": "Schließen", "common.back_home": "Zurück zur Startseite",
    "listings.eyebrow": "Vollständiges Register", "listings.heading": "Alle erfassten Immobilien",
    "listings.search_placeholder": "Stadt, PLZ, Ort oder Viertel…",
    "listings.our_eyebrow": "Unsere Angebote", "listings.our_heading": "Geprüfte Immobilien im eigenen Bestand",
    "listings.nationwide_eyebrow": "Landesweite Suche",
    "agents.eyebrow": "Das Team", "agents.heading": "Registrierte Makler",
    "about.eyebrow": "Unsere Geschichte", "about.heading": "Zwei Jahrzehnte makellose Aktenführung.",
    "reviews.eyebrow": "Nur verifizierte Käufer", "reviews.heading": "Was Käufer sagen",
    "contact.eyebrow": "Kontaktieren Sie uns", "contact.heading": "Sprechen Sie mit dem Büro",
    "contact.office": "Büro", "contact.hours": "Öffnungszeiten",
    "dashboard.heading": "Gespeicherte Immobilien",
    "login.heading": "Anmelden", "login.new_here": "Neu hier?",
    "signup.heading": "Konto erstellen", "signup.already": "Bereits registriert?",
    "listing.book_viewing": "Besichtigung vereinbaren", "listing.pay_btc": "Reservierungsgebühr in BTC bezahlen",
    "listing.message_agent": "Nachricht an den Makler senden"
  },
  zh: {
    "nav.home": "首页", "nav.listings": "房源", "nav.agents": "经纪人",
    "nav.history": "我们的历史", "nav.reviews": "评价", "nav.contact": "联系我们",
    "hero.eyebrow": "买房 · 租房 · 已核实房源",
    "hero.heading": "找到您可以信赖的家。",
    "hero.copy": "每套房源在上线前都会核实产权。浏览房源、预约看房，并可使用美元或比特币安全支付。",
    "hero.search_placeholder": "按城市或社区搜索，例如奥斯汀、丹佛…",
    "hero.search_btn": "搜索", "btn.view_all": "查看全部 →", "footer.copyright_suffix": "房地产",
    "common.search": "搜索", "common.for_sale": "出售", "common.for_rent": "出租",
    "common.sale_or_rent": "出售或出租", "common.all": "全部", "common.min_price": "最低 $", "common.max_price": "最高 $",
    "common.save": "保存", "common.sign_in": "登录", "common.sign_out": "退出登录",
    "common.create_account": "创建账户", "common.email": "电子邮件", "common.password": "密码",
    "common.full_name": "姓名", "common.phone": "电话", "common.message": "留言",
    "common.send": "发送", "common.close": "关闭", "common.back_home": "返回首页",
    "listings.eyebrow": "完整登记", "listings.heading": "所有已登记房源",
    "listings.search_placeholder": "城市、邮编、城镇或社区…",
    "listings.our_eyebrow": "我们的房源", "listings.our_heading": "经核实的自营房源",
    "listings.nationwide_eyebrow": "全国搜索",
    "agents.eyebrow": "团队", "agents.heading": "登记经纪人",
    "about.eyebrow": "我们的故事", "about.heading": "二十年来始终把记录做得清清楚楚。",
    "reviews.eyebrow": "仅限已验证买家", "reviews.heading": "买家怎么说",
    "contact.eyebrow": "联系我们", "contact.heading": "与办公室联系",
    "contact.office": "办公室", "contact.hours": "营业时间",
    "dashboard.heading": "已保存的房源",
    "login.heading": "登录", "login.new_here": "初次使用？",
    "signup.heading": "创建账户", "signup.already": "已经注册？",
    "listing.book_viewing": "预约看房", "listing.pay_btc": "使用比特币支付预约费",
    "listing.message_agent": "给经纪人留言"
  },
  ar: {
    "nav.home": "الرئيسية", "nav.listings": "العقارات", "nav.agents": "الوكلاء",
    "nav.history": "قصتنا", "nav.reviews": "التقييمات", "nav.contact": "اتصل بنا",
    "hero.eyebrow": "شراء · إيجار · عقارات موثقة",
    "hero.heading": "اعثر على منزل يمكنك الوثوق به.",
    "hero.copy": "يتم التحقق من كل عقار مقابل سند الملكية قبل نشره. تصفح العقارات، احجز معاينة، وادفع بأمان بالدولار الأمريكي أو البيتكوين.",
    "hero.search_placeholder": "ابحث حسب المدينة أو الحي، مثل أوستن، دنفر…",
    "hero.search_btn": "بحث", "btn.view_all": "عرض الكل ←", "footer.copyright_suffix": "عقارات",
    "common.search": "بحث", "common.for_sale": "للبيع", "common.for_rent": "للإيجار",
    "common.sale_or_rent": "بيع أو إيجار", "common.all": "الكل", "common.min_price": "الحد الأدنى $", "common.max_price": "الحد الأقصى $",
    "common.save": "حفظ", "common.sign_in": "تسجيل الدخول", "common.sign_out": "تسجيل الخروج",
    "common.create_account": "إنشاء حساب", "common.email": "البريد الإلكتروني", "common.password": "كلمة المرور",
    "common.full_name": "الاسم الكامل", "common.phone": "الهاتف", "common.message": "رسالة",
    "common.send": "إرسال", "common.close": "إغلاق", "common.back_home": "العودة إلى الصفحة الرئيسية",
    "listings.eyebrow": "السجل الكامل", "listings.heading": "جميع العقارات المسجلة",
    "listings.search_placeholder": "المدينة أو الرمز البريدي أو الحي…",
    "listings.our_eyebrow": "عقاراتنا", "listings.our_heading": "عقارات موثقة تملكها الوكالة",
    "listings.nationwide_eyebrow": "بحث على مستوى البلاد",
    "agents.eyebrow": "الفريق", "agents.heading": "الوكلاء المسجلون",
    "about.eyebrow": "قصتنا", "about.heading": "عقدان من حفظ السجلات بدقة.",
    "reviews.eyebrow": "للمشترين الموثقين فقط", "reviews.heading": "ماذا يقول المشترون",
    "contact.eyebrow": "تواصل معنا", "contact.heading": "تحدث مع المكتب",
    "contact.office": "المكتب", "contact.hours": "ساعات العمل",
    "dashboard.heading": "العقارات المحفوظة",
    "login.heading": "تسجيل الدخول", "login.new_here": "جديد هنا؟",
    "signup.heading": "إنشاء حساب", "signup.already": "مسجل بالفعل؟",
    "listing.book_viewing": "حجز معاينة", "listing.pay_btc": "دفع رسوم الحجز بالبيتكوين",
    "listing.message_agent": "إرسال رسالة إلى الوكيل"
  },
  it: {
    "nav.home": "Home", "nav.listings": "Annunci", "nav.agents": "Agenti",
    "nav.history": "La Nostra Storia", "nav.reviews": "Recensioni", "nav.contact": "Contatti",
    "hero.eyebrow": "Compra · Affitta · Immobili Verificati",
    "hero.heading": "Trova una casa di cui ti puoi fidare.",
    "hero.copy": "Ogni annuncio viene verificato rispetto al titolo di proprietà prima di essere pubblicato. Sfoglia gli annunci, prenota una visita e paga in sicurezza in USD o BTC.",
    "hero.search_placeholder": "Cerca per città o quartiere, es. Austin, Denver…",
    "hero.search_btn": "Cerca", "btn.view_all": "Vedi tutto →", "footer.copyright_suffix": "Immobiliare",
    "common.search": "Cerca", "common.for_sale": "In vendita", "common.for_rent": "In affitto",
    "common.sale_or_rent": "Vendita o affitto", "common.all": "Tutti", "common.min_price": "Min $", "common.max_price": "Max $",
    "common.save": "Salva", "common.sign_in": "Accedi", "common.sign_out": "Esci",
    "common.create_account": "Crea account", "common.email": "Email", "common.password": "Password",
    "common.full_name": "Nome completo", "common.phone": "Telefono", "common.message": "Messaggio",
    "common.send": "Invia", "common.close": "Chiudi", "common.back_home": "Torna alla home",
    "listings.eyebrow": "Registro completo", "listings.heading": "Tutti gli immobili registrati",
    "listings.search_placeholder": "Città, CAP, paese o quartiere…",
    "listings.our_eyebrow": "I nostri annunci", "listings.our_heading": "Immobili verificati, di proprietà dell'agenzia",
    "listings.nationwide_eyebrow": "Ricerca nazionale",
    "agents.eyebrow": "Il team", "agents.heading": "Agenti registrati",
    "about.eyebrow": "La nostra storia", "about.heading": "Due decenni a tenere i registri in ordine.",
    "reviews.eyebrow": "Solo acquirenti verificati", "reviews.heading": "Cosa dicono gli acquirenti",
    "contact.eyebrow": "Contattaci", "contact.heading": "Parla con l'ufficio",
    "contact.office": "Ufficio", "contact.hours": "Orari",
    "dashboard.heading": "Immobili salvati",
    "login.heading": "Accedi", "login.new_here": "Nuovo qui?",
    "signup.heading": "Crea account", "signup.already": "Già registrato?",
    "listing.book_viewing": "Prenota una visita", "listing.pay_btc": "Paga la caparra in BTC",
    "listing.message_agent": "Invia un messaggio all'agente"
  },
  ja: {
    "nav.home": "ホーム", "nav.listings": "物件", "nav.agents": "エージェント",
    "nav.history": "私たちの歴史", "nav.reviews": "レビュー", "nav.contact": "お問い合わせ",
    "hero.eyebrow": "購入 · 賃貸 · 確認済み物件",
    "hero.heading": "信頼できる住まいを見つけよう。",
    "hero.copy": "すべての物件は公開前に権利証と照合して確認されています。物件を閲覧し、内見を予約して、USDまたはBTCで安全にお支払いいただけます。",
    "hero.search_placeholder": "都市や地域で検索（例：オースティン、デンバー）…",
    "hero.search_btn": "検索", "btn.view_all": "すべて見る →", "footer.copyright_suffix": "不動産",
    "common.search": "検索", "common.for_sale": "売り", "common.for_rent": "賃貸",
    "common.sale_or_rent": "売買・賃貸", "common.all": "すべて", "common.min_price": "最低 $", "common.max_price": "最高 $",
    "common.save": "保存", "common.sign_in": "ログイン", "common.sign_out": "ログアウト",
    "common.create_account": "アカウント作成", "common.email": "メールアドレス", "common.password": "パスワード",
    "common.full_name": "氏名", "common.phone": "電話番号", "common.message": "メッセージ",
    "common.send": "送信", "common.close": "閉じる", "common.back_home": "ホームに戻る",
    "listings.eyebrow": "全登録物件", "listings.heading": "登録されているすべての物件",
    "listings.search_placeholder": "都市、郵便番号、町、地域…",
    "listings.our_eyebrow": "当社の物件", "listings.our_heading": "確認済みの自社所有物件",
    "listings.nationwide_eyebrow": "全国検索",
    "agents.eyebrow": "チーム", "agents.heading": "登録エージェント",
    "about.eyebrow": "私たちの歴史", "about.heading": "二十年にわたり記録を正確に管理してきました。",
    "reviews.eyebrow": "確認済みの購入者のみ", "reviews.heading": "購入者の声",
    "contact.eyebrow": "お問い合わせ", "contact.heading": "オフィスにご連絡ください",
    "contact.office": "オフィス", "contact.hours": "営業時間",
    "dashboard.heading": "保存した物件",
    "login.heading": "ログイン", "login.new_here": "はじめての方ですか？",
    "signup.heading": "アカウント作成", "signup.already": "すでに登録済みですか？",
    "listing.book_viewing": "内見を予約する", "listing.pay_btc": "予約料金をBTCで支払う",
    "listing.message_agent": "エージェントにメッセージを送る"
  },
  ru: {
    "nav.home": "Главная", "nav.listings": "Объекты", "nav.agents": "Агенты",
    "nav.history": "Наша История", "nav.reviews": "Отзывы", "nav.contact": "Контакты",
    "hero.eyebrow": "Покупка · Аренда · Проверенные Объекты",
    "hero.heading": "Найдите дом, которому можно доверять.",
    "hero.copy": "Каждый объект проверяется по документу о праве собственности перед публикацией. Просматривайте объекты, записывайтесь на просмотр и оплачивайте безопасно в USD или BTC.",
    "hero.search_placeholder": "Поиск по городу или району, напр. Остин, Денвер…",
    "hero.search_btn": "Поиск", "btn.view_all": "Смотреть все →", "footer.copyright_suffix": "Недвижимость",
    "common.search": "Поиск", "common.for_sale": "Продажа", "common.for_rent": "Аренда",
    "common.sale_or_rent": "Продажа или аренда", "common.all": "Все", "common.min_price": "Мин $", "common.max_price": "Макс $",
    "common.save": "Сохранить", "common.sign_in": "Войти", "common.sign_out": "Выйти",
    "common.create_account": "Создать аккаунт", "common.email": "Эл. почта", "common.password": "Пароль",
    "common.full_name": "Полное имя", "common.phone": "Телефон", "common.message": "Сообщение",
    "common.send": "Отправить", "common.close": "Закрыть", "common.back_home": "Вернуться на главную",
    "listings.eyebrow": "Полный реестр", "listings.heading": "Все зарегистрированные объекты",
    "listings.search_placeholder": "Город, индекс, посёлок или район…",
    "listings.our_eyebrow": "Наши объекты", "listings.our_heading": "Проверенные объекты в собственности агентства",
    "listings.nationwide_eyebrow": "Поиск по всей стране",
    "agents.eyebrow": "Команда", "agents.heading": "Зарегистрированные агенты",
    "about.eyebrow": "Наша история", "about.heading": "Двадцать лет безупречного ведения документации.",
    "reviews.eyebrow": "Только проверенные покупатели", "reviews.heading": "Что говорят покупатели",
    "contact.eyebrow": "Свяжитесь с нами", "contact.heading": "Свяжитесь с офисом",
    "contact.office": "Офис", "contact.hours": "Часы работы",
    "dashboard.heading": "Сохранённые объекты",
    "login.heading": "Войти", "login.new_here": "Впервые у нас?",
    "signup.heading": "Создать аккаунт", "signup.already": "Уже зарегистрированы?",
    "listing.book_viewing": "Записаться на просмотр", "listing.pay_btc": "Оплатить бронирование в BTC",
    "listing.message_agent": "Написать сообщение агенту"
  },
  hi: {
    "nav.home": "होम", "nav.listings": "लिस्टिंग", "nav.agents": "एजेंट",
    "nav.history": "हमारा इतिहास", "nav.reviews": "समीक्षाएं", "nav.contact": "संपर्क करें",
    "hero.eyebrow": "खरीदें · किराए पर लें · सत्यापित संपत्तियां",
    "hero.heading": "एक ऐसा घर खोजें जिस पर आप भरोसा कर सकें।",
    "hero.copy": "हर लिस्टिंग को प्रकाशित करने से पहले उसके टाइटल के विरुद्ध सत्यापित किया जाता है। ब्राउज़ करें, विज़िट बुक करें, और USD या BTC में सुरक्षित रूप से भुगतान करें।",
    "hero.search_placeholder": "शहर या इलाके से खोजें, जैसे ऑस्टिन, डेनवर…",
    "hero.search_btn": "खोजें", "btn.view_all": "सभी देखें →", "footer.copyright_suffix": "रियल एस्टेट",
    "common.search": "खोजें", "common.for_sale": "बिक्री हेतु", "common.for_rent": "किराए हेतु",
    "common.sale_or_rent": "बिक्री या किराया", "common.all": "सभी", "common.min_price": "न्यूनतम $", "common.max_price": "अधिकतम $",
    "common.save": "सहेजें", "common.sign_in": "साइन इन करें", "common.sign_out": "साइन आउट करें",
    "common.create_account": "खाता बनाएं", "common.email": "ईमेल", "common.password": "पासवर्ड",
    "common.full_name": "पूरा नाम", "common.phone": "फ़ोन", "common.message": "संदेश",
    "common.send": "भेजें", "common.close": "बंद करें", "common.back_home": "होम पर वापस जाएं",
    "listings.eyebrow": "पूर्ण रजिस्ट्री", "listings.heading": "सभी पंजीकृत संपत्तियां",
    "listings.search_placeholder": "शहर, ज़िप कोड, कस्बा या मोहल्ला…",
    "listings.our_eyebrow": "हमारी संपत्तियां", "listings.our_heading": "सत्यापित, एजेंसी-स्वामित्व वाली संपत्तियां",
    "listings.nationwide_eyebrow": "देशव्यापी खोज",
    "agents.eyebrow": "टीम", "agents.heading": "पंजीकृत एजेंट",
    "about.eyebrow": "हमारी कहानी", "about.heading": "दो दशकों से रिकॉर्ड सही रखे हैं।",
    "reviews.eyebrow": "केवल सत्यापित खरीदार", "reviews.heading": "खरीदार क्या कहते हैं",
    "contact.eyebrow": "संपर्क करें", "contact.heading": "कार्यालय से बात करें",
    "contact.office": "कार्यालय", "contact.hours": "समय",
    "dashboard.heading": "सहेजी गई संपत्तियां",
    "login.heading": "साइन इन करें", "login.new_here": "यहाँ नए हैं?",
    "signup.heading": "खाता बनाएं", "signup.already": "पहले से पंजीकृत हैं?",
    "listing.book_viewing": "विज़िट बुक करें", "listing.pay_btc": "बुकिंग शुल्क BTC में भुगतान करें",
    "listing.message_agent": "एजेंट को संदेश भेजें"
  }
};

const RTL_LANGS = new Set(["ar"]);

// Very rough country → language starting guess. This is intentionally a
// small, low-confidence map — it only sets the DEFAULT before the
// browser's own language signal (much more reliable) gets a chance to
// override it below.
const COUNTRY_TO_LANG = {
  MX: "es", ES: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  BR: "pt", PT: "pt", AO: "pt", MZ: "pt",
  FR: "fr", BE: "fr", CI: "fr", SN: "fr", CD: "fr", ML: "fr",
  DE: "de", AT: "de",
  CN: "zh", TW: "zh", HK: "zh",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", JO: "ar",
  QA: "ar", KW: "ar", OM: "ar", BH: "ar", IQ: "ar", LB: "ar", LY: "ar",
  IT: "it",
  JP: "ja",
  RU: "ru", BY: "ru", KZ: "ru",
  IN: "hi"
};

const STORAGE_KEY = "asante_lang";

export function getStoredLang() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  applyLang(lang);
}

export async function detectLang() {
  // 1. A manual choice always wins, once made.
  const stored = getStoredLang();
  if (stored) return stored;

  // 2. The browser's own language setting — the actual standard signal
  // for "preferred language," far more reliable than guessing from IP.
  const browserLang = (navigator.language || "en").slice(0, 2);
  if (TRANSLATIONS[browserLang]) return browserLang;

  // 3. IP/country as a last-resort guess, only when the browser didn't
  // already give us a supported language above.
  try {
    const res = await fetch("/api/geo");
    if (res.ok) {
      const geo = await res.json();
      const guess = COUNTRY_TO_LANG[geo.country];
      if (guess) return guess;
    }
  } catch { /* fall through to default */ }

  return "en";
}

export function applyLang(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict && dict[key]) el.textContent = dict[key];
    else if (el.dataset.i18nEn) el.textContent = el.dataset.i18nEn; // restore English default
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict && dict[key]) el.placeholder = dict[key];
    else if (el.dataset.i18nPlaceholderEn) el.placeholder = el.dataset.i18nPlaceholderEn;
  });
  const select = document.querySelector(".lang-switch select");
  if (select) select.value = lang;
}

// Injects a small language dropdown into the header nav on every page that
// has one (a dropdown reads far cleaner than 11 separate buttons). Call
// once per page load, after the nav exists.
const SWITCHER_LANGS = [
  ["en", "English"], ["es", "Español"], ["pt", "Português"], ["fr", "Français"],
  ["de", "Deutsch"], ["zh", "中文"], ["ar", "العربية"], ["it", "Italiano"],
  ["ja", "日本語"], ["ru", "Русский"], ["hi", "हिन्दी"]
];

export function injectLanguageSwitcher() {
  const nav = document.querySelector(".nav-links");
  if (!nav || document.querySelector(".lang-switch")) return;
  const el = document.createElement("span");
  el.className = "lang-switch";
  el.innerHTML = `<select aria-label="Language">${SWITCHER_LANGS.map(([code, label]) => `<option value="${code}">${label}</option>`).join("")}</select>`;
  nav.appendChild(el);
  el.querySelector("select").addEventListener("change", (e) => setLang(e.target.value));
}

// Before swapping text, stash the original English so switching back to
// English (or an unsupported language) restores it exactly.
export function captureEnglishDefaults() {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.dataset.i18nEn = el.textContent; });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.dataset.i18nPlaceholderEn = el.placeholder; });
}

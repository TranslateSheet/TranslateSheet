
/**
 * Map of language codes to emoji flags.
 */
const emojiFlagMap: Record<string, string> = {
    af: "🇿🇦", // Afrikaans
    ak: "🇬🇭", // Akan
    al: "🇦🇱", // Albanian
    am: "🇪🇹", // Amharic
    ao: "🇦🇴", // Angola (Generic)
    aq: "🇦🇶", // Antarctica
    ar: "🇸🇦", // Arabic
    as: "🇮🇳", // Assamese
    at: "🇦🇹", // Austria
    au: "🇦🇺", // Australia
    aw: "🇦🇼", // Aruba
    ax: "🇦🇽", // Åland Islands
    az: "🇦🇿", // Azerbaijani
    ba: "🇧🇦", // Bosnia and Herzegovina
    bb: "🇧🇧", // Barbados
    bd: "🇧🇩", // Bengali
    be: "🇧🇪", // Dutch (Belgium)
    bg: "🇧🇬", // Bulgarian
    bh: "🇧🇭", // Bahrain
    bi: "🇧🇮", // Kirundi (Burundi)
    bj: "🇧🇯", // Benin
    bl: "🇧🇱", // Saint Barthélemy
    bm: "🇧🇲", // Bermuda
    bn: "🇧🇳", // Brunei
    bo: "🇧🇴", // Bolivia
    bq: "🇧🇶", // Caribbean Netherlands
    br: "🇧🇷", // Brazil
    bs: "🇧🇸", // Bahamas
    bt: "🇧🇹", // Dzongkha (Bhutan)
    bv: "🇧🇻", // Bouvet Island
    bw: "🇧🇼", // Botswana
    by: "🇧🇾", // Belarusian
    bz: "🇧🇿", // Belize
    ca: "🇨🇦", // Canada
    cc: "🇨🇨", // Cocos Islands
    cd: "🇨🇩", // DR Congo
    cf: "🇨🇫", // Central African Republic
    cg: "🇨🇬", // Republic of Congo
    ch: "🇨🇭", // Switzerland
    ci: "🇨🇮", // Côte d’Ivoire
    ck: "🇨🇰", // Cook Islands
    cl: "🇨🇱", // Chile
    cm: "🇨🇲", // Cameroon
    cn: "🇨🇳", // Chinese
    co: "🇨🇴", // Colombia
    cr: "🇨🇷", // Costa Rica
    cu: "🇨🇺", // Cuba
    cv: "🇨🇻", // Cape Verde
    cw: "🇨🇼", // Curaçao
    cx: "🇨🇽", // Christmas Island
    cy: "🇨🇾", // Cyprus
    cz: "🇨🇿", // Czechia
    da: "🇩🇰", // Danish
    de: "🇩🇪", // German
    dj: "🇩🇯", // Djibouti
    dk: "🇩🇰", // Danish
    dz: "🇩🇿", // Algeria
    eg: "🇪🇬", // Arabic (Egypt)
    eh: "🇪🇭", // Western Sahara
    er: "🇪🇷", // Eritrea
    es: "🇪🇸", // Spanish
    et: "🇪🇹", // Amharic (Ethiopia)
    fi: "🇫🇮", // Finnish
    fj: "🇫🇯", // Fiji
    fk: "🇫🇰", // Falkland Islands
    fr: "🇫🇷", // French
    ga: "🇬🇦", // Gabon
    gb: "🇬🇧", // English (UK)
    gd: "🇬🇩", // Grenada
    ge: "🇬🇪", // Georgian
    gf: "🇬🇫", // French Guiana
    gh: "🇬🇭", // Ghana
    gi: "🇬🇮", // Gibraltar
    gl: "🇬🇱", // Greenland
    gm: "🇬🇲", // Gambia
    gn: "🇬🇳", // Guinea
    gp: "🇬🇵", // Guadeloupe
    gq: "🇬🇶", // Equatorial Guinea
    gr: "🇬🇷", // Greek
    gt: "🇬🇹", // Guatemala
    gu: "🇬🇺", // Guam
    gw: "🇬🇼", // Guinea-Bissau
    gy: "🇬🇾", // Guyana
    hk: "🇭🇰", // Hong Kong
    hm: "🇭🇲", // Heard Island and McDonald Islands
    hn: "🇭🇳", // Honduras
    hr: "🇭🇷", // Croatian
    ht: "🇭🇹", // Haitian Creole
    hu: "🇭🇺", // Hungarian
    id: "🇮🇩", // Indonesian
    ie: "🇮🇪", // Irish
    il: "🇮🇱", // Hebrew
    im: "🇮🇲", // Isle of Man
    in: "🇮🇳", // India
    io: "🇮🇴", // British Indian Ocean Territory
    iq: "🇮🇶", // Arabic (Iraq)
    ir: "🇮🇷", // Persian (Iran)
    is: "🇮🇸", // Icelandic
    it: "🇮🇹", // Italian
    jm: "🇯🇲", // Jamaica
    jo: "🇯🇴", // Jordan
    jp: "🇯🇵", // Japanese
    ke: "🇰🇪", // Swahili (Kenya)
    kg: "🇰🇬", // Kyrgyzstan
    kh: "🇰🇭", // Khmer (Cambodia)
    ki: "🇰🇮", // Kiribati
    km: "🇰🇲", // Comoros
    kn: "🇰🇳", // Saint Kitts and Nevis
    kp: "🇰🇵", // North Korea
    kr: "🇰🇷", // Korean (South Korea)
    kw: "🇰🇼", // Arabic (Kuwait)
    kz: "🇰🇿", // Kazakh
    la: "🇱🇦", // Lao
    lb: "🇱🇧", // Arabic (Lebanon)
    lc: "🇱🇨", // Saint Lucia
    li: "🇱🇮", // Liechtenstein
    lk: "🇱🇰", // Sinhala (Sri Lanka)
    lr: "🇱🇷", // Liberia
    ls: "🇱🇸", // Lesotho
    lt: "🇱🇹", // Lithuanian
    lu: "🇱🇺", // Luxembourg
    lv: "🇱🇻", // Latvian
    ly: "🇱🇾", // Arabic (Libya)
    ma: "🇲🇦", // Arabic (Morocco)
    mc: "🇲🇨", // Monaco
    md: "🇲🇩", // Moldova
    me: "🇲🇪", // Montenegro
    mg: "🇲🇬", // Malagasy
    mh: "🇲🇭", // Marshall Islands
    mk: "🇲🇰", // Macedonian
    ml: "🇲🇱", // Mali
    mm: "🇲🇲", // Burmese (Myanmar)
    mn: "🇲🇳", // Mongolian
    mo: "🇲🇴", // Macau
    mp: "🇲🇵", // Northern Mariana Islands
    mq: "🇲🇶", // Martinique
    mr: "🇲🇷", // Arabic (Mauritania)
    ms: "🇲🇸", // Montserrat
    mt: "🇲🇹", // Maltese
    mu: "🇲🇺", // Mauritius
    mv: "🇲🇻", // Dhivehi (Maldives)
    mw: "🇲🇼", // Malawi
    mx: "🇲🇽", // Mexico
    my: "🇲🇾", // Malay
    mz: "🇲🇿", // Mozambique
    na: "🇳🇦", // Namibia
    nc: "🇳🇨", // New Caledonia
    ne: "🇳🇪", // Niger
    nf: "🇳🇫", // Norfolk Island
    ng: "🇳🇬", // Nigeria
    ni: "🇳🇮", // Nicaragua
    nl: "🇳🇱", // Dutch
    no: "🇳🇴", // Norwegian
    np: "🇳🇵", // Nepali
    nr: "🇳🇷", // Nauru
    nu: "🇳🇺", // Niue
    nz: "🇳🇿", // New Zealand
    om: "🇴🇲", // Arabic (Oman)
    pa: "🇵🇦", // Panama
    pe: "🇵🇪", // Spanish (Peru)
    pg: "🇵🇬", // Papua New Guinea
    ph: "🇵🇭", // Filipino
    pk: "🇵🇰", // Urdu (Pakistan)
    pl: "🇵🇱", // Polish
    pt: "🇵🇹", // Portuguese
    pw: "🇵🇼", // Palau
    py: "🇵🇾", // Paraguay
    qa: "🇶🇦", // Arabic (Qatar)
    ro: "🇷🇴", // Romanian
    ru: "🇷🇺", // Russian
    rw: "🇷🇼", // Rwanda
    sa: "🇸🇦", // Arabic (Saudi Arabia)
    sb: "🇸🇧", // Solomon Islands
    sc: "🇸🇨", // Seychelles
    sd: "🇸🇩", // Arabic (Sudan)
    se: "🇸🇪", // Swedish
    sg: "🇸🇬", // Singapore
    si: "🇸🇮", // Slovenian
    sk: "🇸🇰", // Slovak
    sl: "🇸🇱", // Sierra Leone
    sm: "🇸🇲", // San Marino
    sn: "🇸🇳", // Wolof (Senegal)
    so: "🇸🇴", // Somali
    sr: "🇸🇷", // Suriname
    ss: "🇸🇸", // South Sudan
    st: "🇸🇹", // São Tomé and Príncipe
    sv: "🇸🇻", // Spanish (El Salvador)
    sy: "🇸🇾", // Arabic (Syria)
    sz: "🇸🇿", // Swaziland
    tc: "🇹🇨", // Turks and Caicos Islands
    td: "🇹🇩", // Chad
    tg: "🇹🇬", // Togo
    th: "🇹🇭", // Thai
    tj: "🇹🇯", // Tajikistan
    tk: "🇹🇰", // Tokelau
    tl: "🇹🇱", // Tetum (East Timor)
    tm: "🇹🇲", // Turkmenistan
    tn: "🇹🇳", // Arabic (Tunisia)
    to: "🇹🇴", // Tonga
    tr: "🇹🇷", // Turkish
    tt: "🇹🇹", // Trinidad and Tobago
    tv: "🇹🇻", // Tuvalu
    tz: "🇹🇿", // Swahili (Tanzania)
    ua: "🇺🇦", // Ukrainian
    ug: "🇺🇬", // Swahili (Uganda)
    us: "🇺🇸", // English (United States)
    uy: "🇺🇾", // Spanish (Uruguay)
    uz: "🇺🇿", // Uzbek
    va: "🇻🇦", // Vatican City
    vc: "🇻🇨", // Saint Vincent and the Grenadines
    ve: "🇻🇪", // Spanish (Venezuela)
    vg: "🇻🇬", // British Virgin Islands
    vi: "🇻🇮", // US Virgin Islands
    vn: "🇻🇳", // Vietnamese
    vu: "🇻🇺", // Bislama (Vanuatu)
    ws: "🇼🇸", // Samoan (Samoa)
    ye: "🇾🇪", // Arabic (Yemen)
    za: "🇿🇦", // Zulu (South Africa)
    zm: "🇿🇲", // Zambia
    zw: "🇿🇼", // Zimbabwe
  };
  
  export default emojiFlagMap;
  
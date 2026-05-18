import * as fs   from "fs";
import * as path from "path";
import FormData  from "form-data";
import fetch     from "node-fetch";

const API_URL     = process.env.API_URL     || "https://api-production-ada5.up.railway.app/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const IMAGES_DIR  = process.env.IMAGES_DIR  || "./database/catalog-images";

if (!ADMIN_TOKEN) {
  console.error("❌  Falta ADMIN_TOKEN");
  process.exit(1);
}

const SKU_IMAGE_MAP: Record<string, string[]> = {
  "PL-DEL_-0001": [
    "image1.jpg"
  ],
  "PL-DEL_-0002": [
    "image2.jpg"
  ],
  "PL-DEL_-0003": [
    "image3.jpg"
  ],
  "PL-DEL_-0004": [
    "image4.jpg"
  ],
  "PL-DEL_-0005": [
    "image5.jpg"
  ],
  "PL-DEL_-0006": [
    "image6.jpg"
  ],
  "PL-DEL_-0007": [
    "image7.jpg"
  ],
  "PL-DEL_-0008": [
    "image8.jpg"
  ],
  "PL-DEL_-0009": [
    "image9.jpg"
  ],
  "PL-DEL_-0010": [
    "image10.jpg"
  ],
  "PL-DEL_-0011": [
    "image11.jpg"
  ],
  "PL-DEL_-0012": [
    "image12.jpg"
  ],
  "PL-DEL_-0013": [
    "image13.jpg"
  ],
  "PL-DEL_-0014": [
    "image14.jpg"
  ],
  "PL-DEL_-0015": [
    "image15.jpg"
  ],
  "PL-DEL_-0016": [
    "image16.jpg"
  ],
  "PL-DEL_-0017": [
    "image17.jpg"
  ],
  "PL-DEL_-0018": [
    "image18.jpg"
  ],
  "PL-DEL_-0019": [
    "image19.jpg"
  ],
  "PL-DEL_-0020": [
    "image20.jpg"
  ],
  "PL-DEL_-0021": [
    "image21.jpg"
  ],
  "PL-DEL_-0022": [
    "image22.jpg"
  ],
  "PL-DEL_-0023": [
    "image23.jpg"
  ],
  "PL-DEL_-0024": [
    "image24.jpg"
  ],
  "PL-DEL_-0025": [
    "image25.jpg"
  ],
  "PL-DEL_-0026": [
    "image26.jpg"
  ],
  "PL-DEL_-0027": [
    "image27.jpg"
  ],
  "PL-DEL_-0028": [
    "image28.jpg"
  ],
  "PL-DEL_-0029": [
    "image29.jpg"
  ],
  "PL-DEL_-0030": [
    "image30.jpg"
  ],
  "PL-DEL_-0031": [
    "image31.jpg"
  ],
  "PL-DEL_-0032": [
    "image32.jpg"
  ],
  "PL-DEL_-0033": [
    "image33.jpg"
  ],
  "PL-DEL_-0034": [
    "image34.jpg"
  ],
  "PL-DEL_-0035": [
    "image35.jpg"
  ],
  "PL-DEL_-0036": [
    "image36.jpg"
  ],
  "PL-DEL_-0037": [
    "image37.jpg"
  ],
  "PL-DEL_-0038": [
    "image38.jpg"
  ],
  "PL-DEL_-0039": [
    "image39.jpg"
  ],
  "PL-DEL_-0040": [
    "image40.jpg"
  ],
  "PL-DEL_-0041": [
    "image41.jpg"
  ],
  "PL-DEL_-0042": [
    "image42.jpg"
  ],
  "PL-DEL_-0043": [
    "image43.jpg"
  ],
  "PL-DEL_-0044": [
    "image44.jpg"
  ],
  "PL-DEL_-0045": [
    "image45.jpg"
  ],
  "PL-DEL_-0046": [
    "image46.jpg"
  ],
  "PL-DEL_-0047": [
    "image47.jpg"
  ],
  "PL-DEL_-0048": [
    "image48.jpg"
  ],
  "PL-DEL_-0049": [
    "image49.jpg"
  ],
  "PL-DEL_-0050": [
    "image50.jpg"
  ],
  "PL-DEL_-0051": [
    "image51.jpg"
  ],
  "PL-DEL_-0052": [
    "image52.jpg"
  ],
  "PL-DEL_-0053": [
    "image53.jpg"
  ],
  "PL-DEL_-0054": [
    "image54.jpg"
  ],
  "PL-DEL_-0055": [
    "image55.jpg"
  ],
  "PL-DEL_-0056": [
    "image56.jpg"
  ],
  "PL-DEL_-0057": [
    "image57.jpg"
  ],
  "PL-DEL_-0058": [
    "image58.jpg"
  ],
  "PL-DEL_-0059": [
    "image59.jpg"
  ],
  "PL-DEL_-0060": [
    "image60.jpg"
  ],
  "PL-DEL_-0061": [
    "image61.jpg"
  ],
  "PL-DEL_-0062": [
    "image62.jpg"
  ],
  "PL-DEL_-0063": [
    "image63.jpg"
  ],
  "PL-DEL_-0064": [
    "image64.jpg"
  ],
  "PL-DEL_-0065": [
    "image65.jpg"
  ],
  "PL-DEL_-0066": [
    "image66.jpg"
  ],
  "PL-DEL_-0067": [
    "image67.jpg"
  ],
  "PL-DEL_-0068": [
    "image68.jpg"
  ],
  "PL-DEL_-0069": [
    "image69.jpg"
  ],
  "PL-DEL_-0070": [
    "image70.jpg"
  ],
  "PL-DEL_-0071": [
    "image71.jpg"
  ],
  "PL-DEL_-0072": [
    "image72.jpg"
  ],
  "PL-DEL_-0073": [
    "image73.jpg"
  ],
  "PL-DEL_-0074": [
    "image74.jpg"
  ],
  "PL-DEL_-0075": [
    "image75.jpg"
  ],
  "PL-DEL_-0076": [
    "image76.jpg"
  ],
  "PL-DEL_-0077": [
    "image77.jpg"
  ],
  "PL-DEL_-0078": [
    "image78.jpg"
  ],
  "PL-DEL_-0079": [
    "image79.jpg"
  ],
  "PL-DEL_-0080": [
    "image80.jpg"
  ],
  "PL-DEL_-0081": [
    "image81.jpg"
  ],
  "PL-DEL_-0082": [
    "image82.jpg"
  ],
  "PL-DEL_-0083": [
    "image83.jpg"
  ],
  "PL-DEL_-0084": [
    "image84.jpg"
  ],
  "PL-DEL_-0085": [
    "image85.jpg"
  ],
  "PL-DEL_-0086": [
    "image86.jpg"
  ],
  "PL-DEL_-0087": [
    "image87.jpg"
  ],
  "PL-DEL_-0088": [
    "image88.jpg"
  ],
  "PL-DEL_-0089": [
    "image89.jpg"
  ],
  "PL-DEL_-0090": [
    "image90.jpg"
  ],
  "PL-DEL_-0091": [
    "image91.jpg"
  ],
  "PL-DEL_-0092": [
    "image92.jpg"
  ],
  "PL-DEL_-0093": [
    "image93.jpg"
  ],
  "PL-DEL_-0094": [
    "image94.jpg"
  ],
  "PL-DEL_-0095": [
    "image95.jpg"
  ],
  "PL-DEL_-0096": [
    "image96.jpg"
  ],
  "PL-DEL_-0097": [
    "image97.jpg"
  ],
  "PL-DEL_-0098": [
    "image98.jpg"
  ],
  "PL-DEL_-0099": [
    "image99.jpg"
  ],
  "PL-DEL_-0100": [
    "image100.jpg"
  ],
  "PL-DEL_-0101": [
    "image101.jpg"
  ],
  "PL-DEL_-0102": [
    "image102.jpg"
  ],
  "PL-DEL_-0103": [
    "image103.jpg"
  ],
  "PL-DEL_-0104": [
    "image104.jpg"
  ],
  "PL-DEL_-0105": [
    "image105.jpg"
  ],
  "PL-DEL_-0106": [
    "image106.jpg"
  ],
  "PL-DEL_-0107": [
    "image107.jpg"
  ],
  "PL-DEL_-0108": [
    "image108.jpg"
  ],
  "PL-DEL_-0109": [
    "image109.jpg"
  ],
  "PL-DEL_-0110": [
    "image110.jpg"
  ],
  "PL-DEL_-0111": [
    "image111.jpg"
  ],
  "PL-DEL_-0112": [
    "image112.jpg"
  ],
  "PL-DEL_-0113": [
    "image113.jpg"
  ],
  "PL-DEL_-0114": [
    "image114.jpg"
  ],
  "PL-DEL_-0115": [
    "image115.jpg"
  ],
  "PL-DEL_-0116": [
    "image116.jpg"
  ],
  "PL-DEL_-0117": [
    "image117.jpg"
  ],
  "PL-DEL_-0118": [
    "image118.jpg"
  ],
  "PL-DEL_-0119": [
    "image119.jpg"
  ],
  "PL-DEL_-0120": [
    "image120.jpg"
  ],
  "PL-DEL_-0121": [
    "image121.jpg"
  ],
  "PL-DEL_-0122": [
    "image122.jpg"
  ],
  "PL-DEL_-0123": [
    "image123.jpg"
  ],
  "PL-DEL_-0124": [
    "image124.jpg"
  ],
  "PL-DEL_-0125": [
    "image125.jpg"
  ],
  "PL-DEL_-0126": [
    "image126.jpg"
  ],
  "PL-DEL_-0127": [
    "image127.jpg"
  ],
  "PL-DEL_-0128": [
    "image128.jpg"
  ],
  "PL-DEL_-0129": [
    "image129.jpg"
  ],
  "PL-DEL_-0130": [
    "image130.jpg"
  ],
  "PL-DEL_-0131": [
    "image131.jpg"
  ],
  "PL-DEL_-0132": [
    "image132.jpg"
  ],
  "PL-DEL_-0133": [
    "image133.jpg"
  ],
  "PL-DEL_-0134": [
    "image134.jpg"
  ],
  "PL-DEL_-0135": [
    "image135.jpg"
  ],
  "PL-DEL_-0136": [
    "image136.jpg"
  ],
  "PL-DEL_-0137": [
    "image137.jpg"
  ],
  "PL-DEL_-0138": [
    "image138.jpg"
  ],
  "PL-DEL_-0139": [
    "image139.jpg"
  ],
  "PL-DEL_-0140": [
    "image140.jpg"
  ],
  "PL-DEL_-0141": [
    "image141.jpg"
  ],
  "PL-DEL_-0142": [
    "image142.jpg"
  ],
  "PL-DEL_-0143": [
    "image143.jpg"
  ],
  "PL-DEL_-0144": [
    "image144.jpg"
  ],
  "PL-DEL_-0145": [
    "image145.jpg"
  ],
  "PL-DEL_-0146": [
    "image146.jpg"
  ],
  "PL-DEL_-0147": [
    "image147.jpg"
  ],
  "PL-DEL_-0148": [
    "image148.jpg"
  ],
  "PL-DEL_-0149": [
    "image149.jpg"
  ],
  "PL-DEL_-0150": [
    "image150.jpg"
  ],
  "PL-DEL_-0151": [
    "image151.jpg"
  ],
  "PL-DEL_-0152": [
    "image152.jpg"
  ],
  "PL-DEL_-0153": [
    "image153.jpg"
  ],
  "PL-DEL_-0154": [
    "image154.jpg"
  ],
  "PL-DEL_-0155": [
    "image155.jpg"
  ],
  "PL-DEL_-0156": [
    "image156.jpg"
  ],
  "PL-DEL_-0157": [
    "image157.jpg"
  ],
  "PL-DEL_-0158": [
    "image158.jpg"
  ],
  "PL-DEL_-0159": [
    "image159.jpg"
  ],
  "PL-DEL_-0160": [
    "image160.jpg"
  ],
  "PL-DEL_-0161": [
    "image161.jpg"
  ],
  "PL-DEL_-0162": [
    "image162.jpg"
  ],
  "PL-DEL_-0163": [
    "image163.jpg"
  ],
  "PL-DEL_-0164": [
    "image164.jpg"
  ],
  "PL-DEL_-0165": [
    "image165.jpg"
  ],
  "PL-DEL_-0166": [
    "image166.jpg"
  ],
  "PL-DEL_-0167": [
    "image167.jpg"
  ],
  "PL-DEL_-0168": [
    "image168.jpg"
  ],
  "PL-DEL_-0169": [
    "image169.jpg"
  ],
  "PL-DEL_-0170": [
    "image170.jpg"
  ],
  "PL-DEL_-0171": [
    "image171.jpg"
  ],
  "PL-DEL_-0172": [
    "image172.jpg"
  ],
  "PL-DEL_-0173": [
    "image173.jpg"
  ],
  "PL-DEL_-0174": [
    "image174.jpg"
  ],
  "PL-DEL_-0175": [
    "image175.jpg"
  ],
  "PL-DEL_-0176": [
    "image176.jpg"
  ],
  "PL-DEL_-0177": [
    "image177.jpg"
  ],
  "PL-DEL_-0178": [
    "image178.jpg"
  ],
  "PL-DEL_-0179": [
    "image179.jpg"
  ],
  "PL-DEL_-0180": [
    "image180.jpg"
  ],
  "PL-DEL_-0181": [
    "image181.jpg"
  ],
  "PL-DEL_-0182": [
    "image182.jpg"
  ],
  "PL-DEL_-0183": [
    "image183.jpg"
  ],
  "PL-DEL_-0184": [
    "image184.jpg"
  ],
  "PL-DEL_-0185": [
    "image185.jpg"
  ],
  "PL-DEL_-0186": [
    "image186.jpg"
  ],
  "PL-DEL_-0187": [
    "image187.jpg"
  ],
  "PL-DEL_-0188": [
    "image188.jpg"
  ],
  "PL-DEL_-0189": [
    "image189.jpg"
  ],
  "PL-DEL_-0190": [
    "image190.jpg"
  ],
  "PL-DEL_-0191": [
    "image191.jpg"
  ],
  "PL-DEL_-0192": [
    "image192.jpg"
  ],
  "PL-DEL_-0193": [
    "image193.jpg"
  ],
  "PL-DEL_-0194": [
    "image194.jpg"
  ],
  "PL-DEL_-0195": [
    "image195.jpg"
  ],
  "PL-DEL_-0196": [
    "image196.jpg"
  ],
  "PL-DEL_-0197": [
    "image197.jpg"
  ],
  "PL-DEL_-0198": [
    "image198.jpg"
  ],
  "PL-DEL_-0199": [
    "image199.jpg"
  ],
  "PL-DEL_-0200": [
    "image200.jpg"
  ],
  "PL-DEL_-0201": [
    "image201.jpg"
  ],
  "PL-DEL_-0202": [
    "image202.jpg"
  ],
  "PL-DEL_-0203": [
    "image203.jpg"
  ],
  "PL-DEL_-0204": [
    "image204.jpg"
  ],
  "PL-DEL_-0205": [
    "image205.jpg"
  ],
  "PL-DEL_-0206": [
    "image206.jpg"
  ],
  "PL-DEL_-0207": [
    "image207.jpg"
  ],
  "PL-DEL_-0208": [
    "image208.jpg"
  ],
  "PL-DEL_-0209": [
    "image209.jpg"
  ],
  "PL-DEL_-0210": [
    "image210.jpg"
  ],
  "PL-DEL_-0211": [
    "image211.jpg"
  ],
  "PL-DEL_-0212": [
    "image212.jpg"
  ],
  "PL-DEL_-0213": [
    "image213.jpg"
  ],
  "PL-DEL_-0214": [
    "image214.jpg"
  ],
  "PL-DEL_-0215": [
    "image215.jpg"
  ],
  "PL-DEL_-0216": [
    "image216.jpg"
  ],
  "PL-DEL_-0217": [
    "image217.jpg"
  ],
  "PL-DEL_-0218": [
    "image218.jpg"
  ],
  "PL-DEL_-0219": [
    "image219.jpg"
  ],
  "PL-DEL_-0220": [
    "image220.jpg"
  ],
  "PL-DEL_-0221": [
    "image221.jpg"
  ],
  "PL-DEL_-0222": [
    "image222.jpg"
  ],
  "PL-DEL_-0223": [
    "image223.jpg"
  ],
  "PL-DEL_-0224": [
    "image224.jpg"
  ],
  "PL-DEL_-0225": [
    "image225.jpg"
  ],
  "PL-DEL_-0226": [
    "image226.jpg"
  ],
  "PL-DEL_-0227": [
    "image227.jpg"
  ],
  "PL-DEL_-0228": [
    "image228.jpg"
  ],
  "PL-DEL_-0229": [
    "image229.jpg"
  ],
  "PL-DEL_-0230": [
    "image230.jpg"
  ],
  "PL-DEL_-0231": [
    "image231.jpg"
  ],
  "PL-DEL_-0232": [
    "image232.jpg"
  ],
  "PL-DEL_-0233": [
    "image233.jpg"
  ],
  "PL-DEL_-0234": [
    "image234.jpg"
  ],
  "PL-DEL_-0235": [
    "image235.jpg"
  ],
  "PL-DEL_-0236": [
    "image236.jpg"
  ],
  "PL-DEL_-0237": [
    "image237.jpg"
  ],
  "PL-DEL_-0238": [
    "image238.jpg"
  ],
  "PL-DEL_-0239": [
    "image239.jpg"
  ],
  "PL-DEL_-0240": [
    "image240.jpg"
  ],
  "PL-DEL_-0241": [
    "image241.jpg"
  ],
  "PL-DEL_-0242": [
    "image242.jpg"
  ],
  "PL-DEL_-0243": [
    "image243.jpg"
  ],
  "PL-DEL_-0244": [
    "image244.jpg"
  ],
  "PL-DEL_-0245": [
    "image245.jpg"
  ],
  "PL-DEL_-0246": [
    "image246.jpg"
  ],
  "PL-DEL_-0247": [
    "image247.jpg"
  ],
  "PL-DEL_-0248": [
    "image248.jpg"
  ],
  "PL-DEL_-0249": [
    "image249.jpg"
  ],
  "PL-DEL_-0250": [
    "image250.jpg"
  ],
  "PL-DEL_-0251": [
    "image251.jpg"
  ],
  "PL-DEL_-0252": [
    "image252.jpg"
  ],
  "PL-DEL_-0253": [
    "image253.jpg"
  ],
  "PL-DEL_-0254": [
    "image254.jpg"
  ],
  "PL-DEL_-0255": [
    "image255.jpg"
  ],
  "PL-DEL_-0256": [
    "image256.jpg"
  ],
  "PL-DEL_-0257": [
    "image257.jpg"
  ],
  "PL-DEL_-0258": [
    "image258.jpg"
  ],
  "PL-DEL_-0259": [
    "image259.jpg"
  ],
  "PL-DEL_-0260": [
    "image260.jpg"
  ],
  "PL-DEL_-0261": [
    "image261.jpg"
  ],
  "PL-DEL_-0262": [
    "image262.jpg"
  ],
  "PL-DEL_-0263": [
    "image263.jpg"
  ],
  "PL-DEL_-0264": [
    "image264.jpg"
  ],
  "PL-DEL_-0265": [
    "image265.jpg"
  ],
  "PL-DEL_-0266": [
    "image266.jpg"
  ],
  "PL-DEL_-0267": [
    "image267.jpg"
  ],
  "PL-DEL_-0268": [
    "image268.jpg"
  ],
  "PL-DEL_-0269": [
    "image269.jpg"
  ],
  "PL-DEL_-0270": [
    "image270.jpg"
  ],
  "PL-DEL_-0271": [
    "image271.jpg"
  ],
  "PL-DEL_-0272": [
    "image272.jpg"
  ],
  "PL-DEL_-0273": [
    "image273.jpg"
  ],
  "PL-DEL_-0274": [
    "image274.jpg"
  ],
  "PL-DEL_-0275": [
    "image275.jpg"
  ],
  "PL-DEL_-0276": [
    "image276.jpg"
  ],
  "PL-DEL_-0277": [
    "image277.jpg"
  ],
  "PL-DEL_-0278": [
    "image278.jpg"
  ],
  "PL-DEL_-0279": [
    "image279.jpg"
  ],
  "PL-DEL_-0280": [
    "image280.jpg"
  ],
  "PL-DEL_-0281": [
    "image281.jpg"
  ],
  "PL-DEL_-0282": [
    "image282.jpg"
  ],
  "PL-DEL_-0283": [
    "image283.jpg"
  ],
  "PL-DEL_-0284": [
    "image284.jpg"
  ],
  "PL-DEL_-0285": [
    "image285.jpg"
  ],
  "PL-DEL_-0286": [
    "image286.jpg"
  ],
  "PL-DEL_-0287": [
    "image287.jpg"
  ],
  "PL-DEL_-0288": [
    "image288.jpg"
  ],
  "PL-DEL_-0289": [
    "image289.jpg"
  ],
  "PL-DEL_-0290": [
    "image290.jpg"
  ],
  "PL-DEL_-0291": [
    "image291.jpg"
  ],
  "PL-DEL_-0292": [
    "image292.jpg"
  ],
  "PL-DEL_-0293": [
    "image293.jpg"
  ],
  "PL-DEL_-0294": [
    "image294.jpg"
  ],
  "PL-DEL_-0295": [
    "image295.jpg"
  ],
  "PL-DEL_-0296": [
    "image296.jpg"
  ],
  "PL-DEL_-0297": [
    "image297.jpg"
  ],
  "PL-DEL_-0298": [
    "image298.jpg"
  ],
  "PL-DEL_-0299": [
    "image299.jpg"
  ],
  "PL-DEL_-0300": [
    "image300.jpg"
  ],
  "PL-DEL_-0301": [
    "image301.jpg"
  ],
  "PL-DEL_-0302": [
    "image302.jpg"
  ],
  "PL-DEL_-0303": [
    "image303.jpg"
  ],
  "PL-DEL_-0304": [
    "image304.jpg"
  ],
  "PL-DEL_-0305": [
    "image305.jpg"
  ],
  "PL-DEL_-0306": [
    "image306.jpg"
  ],
  "PL-DEL_-0307": [
    "image307.jpg"
  ],
  "PL-DEL_-0308": [
    "image308.jpg"
  ],
  "PL-DEL_-0309": [
    "image309.jpg"
  ],
  "PL-DEL_-0310": [
    "image310.jpg"
  ],
  "PL-DEL_-0311": [
    "image311.jpg"
  ],
  "PL-DEL_-0312": [
    "image312.jpg"
  ],
  "PL-DEL_-0313": [
    "image313.jpg"
  ],
  "PL-DEL_-0314": [
    "image314.jpg"
  ],
  "PL-DEL_-0315": [
    "image315.jpg"
  ],
  "PL-DEL_-0316": [
    "image316.jpg"
  ],
  "PL-DEL_-0317": [
    "image317.jpg"
  ],
  "PL-DEL_-0318": [
    "image318.jpg"
  ],
  "PL-DEL_-0319": [
    "image319.jpg"
  ],
  "PL-DEL_-0320": [
    "image320.jpg"
  ],
  "PL-DEL_-0321": [
    "image321.jpg"
  ],
  "PL-DEL_-0322": [
    "image322.jpg"
  ],
  "PL-DEL_-0323": [
    "image323.jpg"
  ],
  "PL-DEL_-0324": [
    "image324.jpg"
  ],
  "PL-DEL_-0325": [
    "image325.jpg"
  ],
  "PL-DEL_-0326": [
    "image326.jpg"
  ],
  "PL-DEL_-0327": [
    "image327.jpg"
  ],
  "PL-DEL_-0328": [
    "image328.jpg"
  ],
  "PL-DEL_-0329": [
    "image329.jpg"
  ],
  "PL-DEL_-0330": [
    "image330.jpg"
  ],
  "PL-DEL_-0331": [
    "image331.jpg"
  ],
  "PL-DEL_-0332": [
    "image332.jpg"
  ],
  "PL-DEL_-0333": [
    "image333.jpg"
  ],
  "PL-DEL_-0334": [
    "image334.jpg"
  ],
  "PL-DEL_-0335": [
    "image335.jpg"
  ],
  "PL-DEL_-0336": [
    "image336.jpg"
  ],
  "PL-DEL_-0337": [
    "image337.jpg"
  ],
  "PL-DEL_-0338": [
    "image338.jpg"
  ],
  "PL-DEL_-0339": [
    "image339.jpg"
  ],
  "PL-DEL_-0340": [
    "image340.jpg"
  ],
  "PL-DEL_-0341": [
    "image341.jpg"
  ],
  "PL-DEL_-0342": [
    "image342.jpg"
  ],
  "PL-DEL_-0343": [
    "image343.jpg"
  ],
  "PL-DEL_-0344": [
    "image344.jpg"
  ],
  "PL-DEL_-0345": [
    "image345.jpg"
  ],
  "PL-DEL_-0346": [
    "image346.jpg"
  ],
  "PL-DEL_-0347": [
    "image347.jpg"
  ],
  "PL-DEL_-0348": [
    "image348.jpg"
  ],
  "PL-DEL_-0349": [
    "image349.jpg"
  ],
  "PL-DEL_-0350": [
    "image350.jpg"
  ],
  "PL-DEL_-0351": [
    "image351.jpg"
  ],
  "PL-DEL_-0352": [
    "image352.jpg"
  ],
  "PL-DEL_-0353": [
    "image353.jpg"
  ],
  "PL-DEL_-0354": [
    "image354.jpg"
  ],
  "PL-DEL_-0355": [
    "image355.jpg"
  ],
  "PL-DEL_-0356": [
    "image356.jpg"
  ],
  "PL-DEL_-0357": [
    "image357.jpg"
  ],
  "PL-DEL_-0358": [
    "image358.jpg"
  ],
  "PL-DEL_-0359": [
    "image359.jpg"
  ],
  "PL-DEL_-0360": [
    "image360.jpg"
  ],
  "PL-DEL_-0361": [
    "image361.jpg"
  ],
  "PL-DEL_-0362": [
    "image362.jpg"
  ],
  "PL-DEL_-0363": [
    "image363.jpg"
  ],
  "PL-DEL_-0364": [
    "image364.jpg"
  ],
  "PL-DEL_-0365": [
    "image365.jpg"
  ],
  "PL-DEL_-0366": [
    "image366.jpg"
  ],
  "PL-DEL_-0367": [
    "image367.jpg"
  ],
  "PL-DEL_-0368": [
    "image368.jpg"
  ],
  "PL-DEL_-0369": [
    "image369.jpg"
  ],
  "PL-DEL_-0370": [
    "image370.jpg"
  ],
  "PL-DEL_-0371": [
    "image371.jpg"
  ],
  "PL-DEL_-0372": [
    "image372.jpg"
  ],
  "PL-DEL_-0373": [
    "image373.jpg"
  ],
  "PL-DEL_-0374": [
    "image374.jpg"
  ],
  "PL-DEL_-0375": [
    "image375.jpg"
  ],
  "PL-DEL_-0376": [
    "image376.jpg"
  ],
  "PL-DEL_-0377": [
    "image377.jpg"
  ],
  "PL-DEL_-0378": [
    "image378.jpg"
  ],
  "PL-DEL_-0379": [
    "image379.jpg"
  ],
  "PL-DEL_-0380": [
    "image380.jpg"
  ],
  "PL-DEL_-0381": [
    "image381.jpg"
  ],
  "PL-DEL_-0382": [
    "image382.jpg"
  ],
  "PL-DEL_-0383": [
    "image383.jpg"
  ],
  "PL-DEL_-0384": [
    "image384.jpg"
  ],
  "PL-DEL_-0385": [
    "image385.jpg"
  ],
  "PL-DEL_-0386": [
    "image386.jpg"
  ],
  "PL-DEL_-0387": [
    "image387.jpg"
  ],
  "PL-DEL_-0388": [
    "image388.jpg"
  ],
  "PL-DEL_-0389": [
    "image389.jpg"
  ],
  "PL-DEL_-0390": [
    "image390.jpg"
  ],
  "PL-DEL_-0391": [
    "image391.jpg"
  ],
  "PL-DEL_-0392": [
    "image392.jpg"
  ],
  "PL-DEL_-0393": [
    "image393.jpg"
  ],
  "PL-DEL_-0394": [
    "image394.jpg"
  ],
  "PL-DEL_-0395": [
    "image395.jpg"
  ],
  "PL-DEL_-0396": [
    "image396.jpg"
  ],
  "PL-DEL_-0397": [
    "image397.jpg"
  ],
  "PL-DEL_-0398": [
    "image398.jpg"
  ],
  "PL-DEL_-0399": [
    "image399.jpg"
  ],
  "PL-DEL_-0400": [
    "image400.jpg"
  ],
  "PL-DEL_-0401": [
    "image401.jpg"
  ],
  "PL-DEL_-0402": [
    "image402.jpg"
  ],
  "PL-DEL_-0403": [
    "image403.jpg"
  ],
  "PL-DEL_-0404": [
    "image404.jpg"
  ],
  "PL-DEL_-0405": [
    "image405.jpg"
  ],
  "PL-DEL_-0406": [
    "image406.jpg"
  ],
  "PL-DEL_-0407": [
    "image407.jpg"
  ],
  "PL-DEL_-0408": [
    "image408.jpg"
  ],
  "PL-DEL_-0409": [
    "image409.jpg"
  ],
  "PL-DEL_-0410": [
    "image410.jpg"
  ],
  "PL-DEL_-0411": [
    "image411.jpg"
  ],
  "PL-DEL_-0412": [
    "image412.jpg"
  ],
  "PL-DEL_-0413": [
    "image413.jpg"
  ],
  "PL-DEL_-0414": [
    "image414.jpg"
  ],
  "PL-DEL_-0415": [
    "image415.jpg"
  ],
  "PL-DEL_-0416": [
    "image416.jpg"
  ],
  "PL-DEL_-0417": [
    "image417.jpg"
  ],
  "PL-DEL_-0418": [
    "image418.jpg"
  ],
  "PL-DEL_-0419": [
    "image419.jpg"
  ],
  "PL-DEL_-0420": [
    "image420.jpg"
  ],
  "PL-DEL_-0421": [
    "image421.jpg"
  ],
  "PL-DEL_-0422": [
    "image422.jpg"
  ],
  "PL-DEL_-0423": [
    "image423.jpg"
  ],
  "PL-DEL_-0424": [
    "image424.jpg"
  ],
  "PL-DEL_-0425": [
    "image425.jpg"
  ],
  "PL-DEL_-0426": [
    "image426.jpg"
  ],
  "PL-DEL_-0427": [
    "image427.jpg"
  ],
  "PL-DEL_-0428": [
    "image428.jpg"
  ],
  "PL-DEL_-0429": [
    "image429.jpg"
  ],
  "PL-DEL_-0430": [
    "image430.jpg"
  ],
  "PL-DEL_-0431": [
    "image431.jpg"
  ],
  "PL-DEL_-0432": [
    "image432.jpg"
  ],
  "PL-DEL_-0433": [
    "image433.jpg"
  ],
  "PL-DEL_-0434": [
    "image434.jpg"
  ],
  "PL-DEL_-0435": [
    "image435.jpg"
  ],
  "PL-DEL_-0436": [
    "image436.jpg"
  ],
  "PL-DEL_-0437": [
    "image437.jpg"
  ],
  "PL-DEL_-0438": [
    "image438.jpg"
  ],
  "PL-DEL_-0439": [
    "image439.jpg"
  ],
  "PL-DEL_-0440": [
    "image440.jpg"
  ],
  "PL-DEL_-0441": [
    "image441.jpg"
  ],
  "PL-DEL_-0442": [
    "image442.jpg"
  ],
  "PL-DEL_-0443": [
    "image443.jpg"
  ],
  "PL-DEL_-0444": [
    "image444.jpg"
  ],
  "PL-DEL_-0445": [
    "image445.jpg"
  ],
  "PL-DEL_-0446": [
    "image446.jpg"
  ],
  "PL-DEL_-0447": [
    "image447.jpg"
  ],
  "PL-DEL_-0448": [
    "image448.jpg"
  ],
  "PL-DEL_-0449": [
    "image449.jpg"
  ],
  "PL-DEL_-0450": [
    "image450.jpg"
  ],
  "PL-DEL_-0451": [
    "image451.jpg"
  ],
  "PL-DEL_-0452": [
    "image452.jpg"
  ],
  "PL-DEL_-0453": [
    "image453.jpg"
  ],
  "PL-DEL_-0454": [
    "image454.jpg"
  ],
  "PL-DEL_-0455": [
    "image455.jpg"
  ],
  "PL-DEL_-0456": [
    "image456.jpg"
  ],
  "PL-DEL_-0457": [
    "image457.jpg"
  ],
  "PL-DEL_-0458": [
    "image458.jpg"
  ],
  "PL-DEL_-0459": [
    "image459.jpg"
  ],
  "PL-DEL_-0460": [
    "image460.jpg"
  ],
  "PL-DEL_-0461": [
    "image461.jpg"
  ],
  "PL-DEL_-0462": [
    "image462.jpg"
  ],
  "PL-DEL_-0463": [
    "image463.jpg"
  ],
  "PL-DEL_-0464": [
    "image464.jpg"
  ],
  "PL-DEL_-0465": [
    "image465.jpg"
  ],
  "PL-DEL_-0466": [
    "image466.jpg"
  ],
  "PL-DEL_-0467": [
    "image467.jpg"
  ],
  "PL-DEL_-0468": [
    "image468.jpg"
  ],
  "PL-DEL_-0469": [
    "image469.jpg"
  ],
  "PL-DEL_-0470": [
    "image470.jpg"
  ],
  "PL-DEL_-0471": [
    "image471.jpg"
  ],
  "PL-DEL_-0472": [
    "image472.jpg"
  ],
  "PL-DEL_-0473": [
    "image473.jpg"
  ],
  "PL-DEL_-0474": [
    "image474.jpg"
  ],
  "PL-DEL_-0475": [
    "image475.jpg"
  ],
  "PL-DEL_-0476": [
    "image476.jpg"
  ],
  "PL-DEL_-0477": [
    "image477.jpg"
  ],
  "PL-DEL_-0478": [
    "image478.jpg"
  ],
  "PL-DEL_-0479": [
    "image479.jpg"
  ],
  "PL-DEL_-0480": [
    "image480.jpg"
  ],
  "PL-DEL_-0481": [
    "image481.jpg"
  ],
  "PL-DEL_-0482": [
    "image482.jpg"
  ],
  "PL-DEL_-0483": [
    "image483.jpg"
  ],
  "PL-DEL_-0484": [
    "image484.jpg"
  ],
  "PL-DEL_-0485": [
    "image485.jpg"
  ],
  "PL-DEL_-0486": [
    "image486.jpg"
  ],
  "PL-DEL_-0487": [
    "image487.jpg"
  ],
  "PL-DEL_-0488": [
    "image488.jpg"
  ],
  "PL-DEL_-0489": [
    "image489.jpg"
  ],
  "PL-DEL_-0490": [
    "image490.jpg"
  ],
  "PL-DEL_-0491": [
    "image491.jpg"
  ],
  "PL-DEL_-0492": [
    "image492.jpg"
  ],
  "PL-DEL_-0493": [
    "image493.jpg"
  ],
  "PL-DEL_-0494": [
    "image494.jpg"
  ],
  "PL-DEL_-0495": [
    "image495.jpg"
  ],
  "PL-DEL_-0496": [
    "image496.jpg"
  ],
  "PL-DEL_-0497": [
    "image497.jpg"
  ],
  "PL-DEL_-0498": [
    "image498.jpg"
  ],
  "PL-DEL_-0499": [
    "image499.jpg"
  ],
  "PL-DEL_-0500": [
    "image500.jpg"
  ],
  "PL-DEL_-0501": [
    "image501.jpg"
  ],
  "PL-DEL_-0502": [
    "image502.jpg"
  ],
  "PL-DEL_-0503": [
    "image503.jpg"
  ],
  "PL-DEL_-0504": [
    "image504.jpg"
  ],
  "PL-DEL_-0505": [
    "image505.jpg"
  ],
  "PL-DEL_-0506": [
    "image506.jpg"
  ],
  "PL-DEL_-0507": [
    "image507.jpg"
  ],
  "PL-DEL_-0508": [
    "image508.jpg"
  ],
  "PL-DEL_-0509": [
    "image509.jpg"
  ],
  "PL-DEL_-0510": [
    "image510.jpg"
  ],
  "PL-DEL_-0511": [
    "image511.jpg"
  ],
  "PL-DEL_-0512": [
    "image512.jpg"
  ],
  "PL-DEL_-0513": [
    "image513.jpg"
  ],
  "PL-DEL_-0514": [
    "image514.jpg"
  ],
  "PL-DEL_-0515": [
    "image515.jpg"
  ],
  "PL-DEL_-0516": [
    "image516.jpg"
  ],
  "PL-DEL_-0517": [
    "image517.jpg"
  ],
  "PL-DEL_-0518": [
    "image518.jpg"
  ],
  "PL-DEL_-0519": [
    "image519.jpg"
  ],
  "PL-DEL_-0520": [
    "image520.jpg"
  ],
  "PL-DEL_-0521": [
    "image521.jpg"
  ],
  "PL-DEL_-0522": [
    "image522.jpg"
  ],
  "PL-DEL_-0523": [
    "image523.jpg"
  ],
  "PL-DEL_-0524": [
    "image524.jpg"
  ],
  "PL-DEL_-0525": [
    "image525.jpg"
  ],
  "PL-DEL_-0526": [
    "image526.jpg"
  ],
  "PL-DEL_-0527": [
    "image527.jpg"
  ],
  "PL-DEL_-0528": [
    "image528.jpg"
  ],
  "PL-DEL_-0529": [
    "image529.jpg"
  ],
  "PL-DEL_-0530": [
    "image530.jpg"
  ],
  "PL-DEL_-0531": [
    "image531.jpg"
  ],
  "PL-DEL_-0532": [
    "image532.jpg"
  ],
  "PL-DEL_-0533": [
    "image533.jpg"
  ],
  "PL-DEL_-0534": [
    "image534.jpg"
  ],
  "PL-DEL_-0535": [
    "image535.jpg"
  ],
  "PL-DEL_-0536": [
    "image536.jpg"
  ],
  "PL-DEL_-0537": [
    "image537.jpg"
  ],
  "PL-DEL_-0538": [
    "image538.jpg"
  ],
  "PL-DEL_-0539": [
    "image539.jpg"
  ],
  "PL-DEL_-0540": [
    "image540.jpg"
  ],
  "PL-DEL_-0541": [
    "image541.jpg"
  ],
  "PL-DEL_-0542": [
    "image542.jpg"
  ],
  "PL-DEL_-0543": [
    "image543.jpg"
  ],
  "PL-DEL_-0544": [
    "image544.jpg"
  ],
  "PL-DEL_-0545": [
    "image545.jpg"
  ],
  "PL-DEL_-0546": [
    "image546.jpg"
  ],
  "PL-DEL_-0547": [
    "image547.jpg"
  ],
  "PL-DEL_-0548": [
    "image548.jpg"
  ],
  "PL-DEL_-0549": [
    "image549.jpg"
  ],
  "PL-DEL_-0550": [
    "image550.jpg"
  ],
  "PL-DEL_-0551": [
    "image551.jpg"
  ],
  "PL-DEL_-0552": [
    "image552.jpg"
  ],
  "PL-DEL_-0553": [
    "image553.jpg"
  ],
  "PL-DEL_-0554": [
    "image554.jpg"
  ],
  "PL-DEL_-0555": [
    "image555.jpg"
  ],
  "PL-DEL_-0556": [
    "image556.jpg"
  ],
  "PL-DEL_-0557": [
    "image557.jpg"
  ],
  "PL-DEL_-0558": [
    "image558.jpg"
  ],
  "PL-DEL_-0559": [
    "image559.jpg"
  ],
  "PL-DEL_-0560": [
    "image560.jpg"
  ],
  "PL-DEL_-0561": [
    "image561.jpg"
  ],
  "PL-DEL_-0562": [
    "image562.jpg"
  ],
  "PL-DEL_-0563": [
    "image563.jpg"
  ],
  "PL-DEL_-0564": [
    "image564.jpg"
  ],
  "PL-DEL_-0565": [
    "image565.jpg"
  ],
  "PL-DEL_-0566": [
    "image566.jpg"
  ],
  "PL-DEL_-0567": [
    "image567.jpg"
  ],
  "PL-DEL_-0568": [
    "image568.jpg"
  ],
  "PL-DEL_-0569": [
    "image569.jpg"
  ],
  "PL-DEL_-0570": [
    "image570.jpg"
  ],
  "PL-DEL_-0571": [
    "image571.jpg"
  ],
  "PL-DEL_-0572": [
    "image572.jpg"
  ],
  "PL-DEL_-0573": [
    "image573.jpg"
  ],
  "PL-DEL_-0574": [
    "image574.jpg"
  ],
  "PL-DEL_-0575": [
    "image575.jpg"
  ],
  "PL-DEL_-0576": [
    "image576.jpg"
  ],
  "PL-DEL_-0577": [
    "image577.jpg"
  ],
  "PL-DEL_-0578": [
    "image578.jpg"
  ],
  "PL-DEL_-0579": [
    "image579.jpg"
  ],
  "PL-DEL_-0580": [
    "image580.jpg"
  ],
  "PL-DEL_-0581": [
    "image581.jpg"
  ],
  "PL-DEL_-0582": [
    "image582.jpg"
  ],
  "PL-DEL_-0583": [
    "image583.jpg"
  ],
  "PL-DEL_-0584": [
    "image584.jpg"
  ],
  "PL-DEL_-0585": [
    "image585.jpg"
  ],
  "PL-DEL_-0586": [
    "image586.jpg"
  ],
  "PL-DEL_-0587": [
    "image587.jpg"
  ]
};

async function getProductIdBySku(sku: string): Promise<string | null> {
  const res = await fetch(
    `${API_URL}/products?search=${encodeURIComponent(sku)}&limit=1`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
  );
  if (!res.ok) return null;
  const data: any = await res.json();
  const product = data.data?.find((p: any) => p.sku === sku);
  return product?.id ?? null;
}

async function uploadImage(productId: string, filePath: string): Promise<boolean> {
  const form = new FormData();
  form.append("images", fs.createReadStream(filePath), path.basename(filePath));
  const res = await fetch(`${API_URL}/products/${productId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, ...form.getHeaders() },
    body: form,
  });
  return res.ok;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const skus   = Object.keys(SKU_IMAGE_MAP);
  const totals = { uploaded: 0, skipped: 0, errors: 0 };
  console.log(`\n🚀 Iniciando carga: ${skus.length} SKUs...\n`);

  for (let i = 0; i < skus.length; i++) {
    const sku       = skus[i];
    const filenames = SKU_IMAGE_MAP[sku];
    const progress  = `[${i + 1}/${skus.length}]`;

    const productId = await getProductIdBySku(sku);
    if (!productId) {
      console.warn(`${progress} ⚠️  No encontrado: ${sku}`);
      totals.skipped++;
      continue;
    }

    let uploaded = 0;
    for (const filename of filenames) {
      const filePath = path.join(IMAGES_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`${progress} ⚠️  Imagen no existe: ${filename}`);
        continue;
      }
      const ok = await uploadImage(productId, filePath);
      if (ok) { uploaded++; totals.uploaded++; } else { totals.errors++; }
      await sleep(150);
    }

    if (uploaded > 0) {
      console.log(`${progress} ✓  ${sku} — ${uploaded} imagen(es)`);
    } else {
      console.warn(`${progress} ⚠️  ${sku} — sin imágenes subidas`);
      totals.skipped++;
    }

    if ((i + 1) % 50 === 0) {
      console.log("   ⏸  Pausa de 2s...");
      await sleep(2000);
    }
  }

  console.log(`\n✅ Completado:`);
  console.log(`   ${totals.uploaded} imágenes subidas`);
  console.log(`   ${totals.skipped} SKUs omitidos`);
  console.log(`   ${totals.errors} errores`);
}

main().catch((e) => { console.error("❌ Error:", e); process.exit(1); });

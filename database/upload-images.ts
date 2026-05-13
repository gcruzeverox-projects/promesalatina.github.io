import * as fs   from "fs";
import * as path from "path";
import FormData  from "form-data";
import fetch     from "node-fetch";

const API_URL     = process.env.API_URL     || "https://api-production-ada5.up.railway.app";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const IMAGES_DIR  = process.env.IMAGES_DIR  || "./database/catalog-images";

if (!ADMIN_TOKEN) {
  console.error("❌  Falta ADMIN_TOKEN");
  process.exit(1);
}

const SKU_IMAGE_MAP: Record<string, string[]> = {
  "PL-DEL_-0001": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0002": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0003": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0004": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0005": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0006": [
    "image17.jpg",
    "image12.jpg",
    "image16.jpg",
    "image15.jpg"
  ],
  "PL-DEL_-0007": [
    "image18.jpg",
    "image21.jpg",
    "image20.jpg",
    "image19.jpg"
  ],
  "PL-DEL_-0008": [
    "image18.jpg",
    "image21.jpg",
    "image20.jpg",
    "image19.jpg"
  ],
  "PL-DEL_-0009": [
    "image18.jpg",
    "image21.jpg",
    "image20.jpg",
    "image19.jpg"
  ],
  "PL-DEL_-0010": [
    "image18.jpg",
    "image21.jpg",
    "image20.jpg",
    "image19.jpg"
  ],
  "PL-DEL_-0011": [
    "image22.jpg",
    "image3.jpg"
  ],
  "PL-DE_M-0012": [
    "image23.jpg",
    "image26.jpg",
    "image25.jpg",
    "image24.jpg"
  ],
  "PL-DE_M-0013": [
    "image23.jpg",
    "image26.jpg",
    "image25.jpg",
    "image24.jpg"
  ],
  "PL-DE_M-0014": [
    "image23.jpg",
    "image26.jpg",
    "image25.jpg",
    "image24.jpg"
  ],
  "PL-DE_M-0015": [
    "image23.jpg",
    "image26.jpg",
    "image25.jpg",
    "image24.jpg"
  ],
  "PL-DE_M-0016": [
    "image33.jpg",
    "image28.jpg",
    "image32.jpg",
    "image27.jpg"
  ],
  "PL-DE_M-0017": [
    "image33.jpg",
    "image28.jpg",
    "image32.jpg",
    "image27.jpg"
  ],
  "PL-DE_M-0018": [
    "image33.jpg",
    "image28.jpg",
    "image32.jpg",
    "image27.jpg"
  ],
  "PL-DE_M-0019": [
    "image33.jpg",
    "image28.jpg",
    "image32.jpg",
    "image27.jpg"
  ],
  "PL-DE_M-0025": [
    "image38.jpg",
    "image37.png",
    "image125.jpg",
    "image127.png"
  ],
  "PL-DE_M-0026": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0027": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0028": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0029": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0030": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0031": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0032": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0033": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0034": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0035": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0036": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0037": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_M-0038": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DUCA-0044": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DUCA-0045": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DUCA-0046": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DUCA-0047": [
    "image39.png",
    "image42.jpeg",
    "image41.jpeg",
    "image40.png"
  ],
  "PL-DE_L-0039": [
    "image43.png",
    "image47.png",
    "image46.jpg",
    "image45.png"
  ],
  "PL-DE_L-0040": [
    "image43.png",
    "image47.png",
    "image46.jpg",
    "image45.png"
  ],
  "PL-DE_L-0041": [
    "image43.png",
    "image47.png",
    "image46.jpg",
    "image45.png"
  ],
  "PL-DE_L-0042": [
    "image43.png",
    "image47.png",
    "image46.jpg",
    "image45.png"
  ],
  "PL-DE_L-0043": [
    "image43.png",
    "image47.png",
    "image46.jpg",
    "image45.png"
  ],
  "PL-SULA-0052": [
    "image48.jpg"
  ],
  "PL-SULA-0051": [
    "image48.jpg"
  ],
  "PL-SULA-0053": [
    "image48.jpg"
  ],
  "PL-KERN-0063": [
    "image54.png",
    "image50.jpg",
    "image49.jpg",
    "image53.jpg"
  ],
  "PL-CALI-0064": [
    "image57.jpg",
    "image56.jpg",
    "image58.jpg"
  ],
  "PL-CALI-0065": [
    "image57.jpg",
    "image56.jpg",
    "image58.jpg"
  ],
  "PL-CALI-0066": [
    "image57.jpg",
    "image56.jpg",
    "image58.jpg"
  ],
  "PL-FRUS-0067": [
    "image59.jpg",
    "image60.jpg"
  ],
  "PL-FRUS-0068": [
    "image59.jpg",
    "image60.jpg"
  ],
  "PL-FRUS-0069": [
    "image62.jpg",
    "image61.jpg"
  ],
  "PL-FRUS-0070": [
    "image62.jpg",
    "image61.jpg"
  ],
  "PL-MARI-0072": [
    "image64.jpg",
    "image63.jpg"
  ],
  "PL-MARI-0071": [
    "image64.jpg",
    "image63.jpg"
  ],
  "PL-SULA-0048": [
    "image66.jpeg",
    "image65.png"
  ],
  "PL-SULA-0049": [
    "image66.jpeg",
    "image65.png"
  ],
  "PL-SULA-0050": [
    "image66.jpeg",
    "image65.png"
  ],
  "PL-SHAK-0054": [
    "image66.jpeg",
    "image65.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-SHAK-0055": [
    "image66.jpeg",
    "image65.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-SHAK-0056": [
    "image66.jpeg",
    "image65.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-7_UP-0076": [
    "image78.jpg",
    "image82.png",
    "image81.png",
    "image80.jpg"
  ],
  "PL-COCA-0073": [
    "image78.jpg",
    "image82.png",
    "image81.png",
    "image80.jpg"
  ],
  "PL-COCA-0074": [
    "image78.jpg",
    "image82.png",
    "image81.png",
    "image80.jpg"
  ],
  "PL-LEMO-0084": [
    "image88.jpg",
    "image83.jpg",
    "image87.jpg",
    "image86.png"
  ],
  "PL-TIKY-0080": [
    "image88.jpg",
    "image83.jpg",
    "image87.jpg",
    "image86.png"
  ],
  "PL-LEMO-0082": [
    "image88.jpg",
    "image83.jpg",
    "image87.jpg",
    "image86.png"
  ],
  "PL-LEMO-0083": [
    "image88.jpg",
    "image83.jpg",
    "image87.jpg",
    "image86.png"
  ],
  "PL-ORAN-0088": [
    "image88.jpg",
    "image83.jpg",
    "image87.jpg",
    "image86.png"
  ],
  "PL-ORAN-0085": [
    "image95.jpg",
    "image90.jpg",
    "image94.jpg",
    "image93.jpg"
  ],
  "PL-ORAN-0086": [
    "image95.jpg",
    "image90.jpg",
    "image94.jpg",
    "image93.jpg"
  ],
  "PL-ORAN-0087": [
    "image95.jpg",
    "image90.jpg",
    "image94.jpg",
    "image93.jpg"
  ],
  "PL-MIRI-0089": [
    "image95.jpg",
    "image90.jpg",
    "image94.jpg",
    "image93.jpg"
  ],
  "PL-MIRI-0091": [
    "image95.jpg",
    "image90.jpg",
    "image94.jpg",
    "image93.jpg"
  ],
  "PL-SHAN-0095": [
    "image97.jpg",
    "image100.jpg",
    "image99.jpg",
    "image98.jpg"
  ],
  "PL-SALU-0094": [
    "image97.jpg",
    "image100.jpg",
    "image99.jpg",
    "image98.jpg"
  ],
  "PL-CUZC-0098": [
    "image101.jpg",
    "image104.png",
    "image103.jpg",
    "image102.jpg"
  ],
  "PL-TROP-0099": [
    "image105.png",
    "image106.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-TROP-0100": [
    "image105.png",
    "image106.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-TROP-0101": [
    "image105.png",
    "image106.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-TROP-0102": [
    "image105.png",
    "image106.png",
    "image157.jpg",
    "image162.jpg"
  ],
  "PL-RICA-0103": [
    "image107.jpg",
    "image109.jpg",
    "image108.jpg"
  ],
  "PL-RICA-0104": [
    "image107.jpg",
    "image109.jpg",
    "image108.jpg"
  ],
  "PL-SALV-0105": [
    "image110.jpg",
    "image114.jpeg",
    "image113.jpg",
    "image112.jpg"
  ],
  "PL-SALV-0106": [
    "image110.jpg",
    "image114.jpeg",
    "image113.jpg",
    "image112.jpg"
  ],
  "PL-SALV-0107": [
    "image110.jpg",
    "image114.jpeg",
    "image113.jpg",
    "image112.jpg"
  ],
  "PL-SALV-0108": [
    "image110.jpg",
    "image114.jpeg",
    "image113.jpg",
    "image112.jpg"
  ],
  "PL-SALV-0109": [
    "image110.jpg",
    "image114.jpeg",
    "image113.jpg",
    "image112.jpg"
  ],
  "PL-SALV-0110": [
    "image115.jpg",
    "image116.jpg"
  ],
  "PL-SALV-0111": [
    "image115.jpg",
    "image116.jpg"
  ],
  "PL-SALV-0112": [
    "image115.jpg",
    "image116.jpg"
  ],
  "PL-INDI-0113": [
    "image117.jpg",
    "image120.jpg",
    "image119.jpg",
    "image118.jpg"
  ],
  "PL-INDI-0114": [
    "image117.jpg",
    "image120.jpg",
    "image119.jpg",
    "image118.jpg"
  ],
  "PL-INDI-0115": [
    "image117.jpg",
    "image120.jpg",
    "image119.jpg",
    "image118.jpg"
  ],
  "PL-INDI-0116": [
    "image117.jpg",
    "image120.jpg",
    "image119.jpg",
    "image118.jpg"
  ],
  "PL-PONY-0118": [
    "image121.jpg",
    "image124.jpg",
    "image123.jpg",
    "image122.jpg"
  ],
  "PL-ADRE-0119": [
    "image125.jpg",
    "image127.png",
    "image126.jpg",
    "image157.jpg"
  ],
  "PL-ADRE-0120": [
    "image125.jpg",
    "image127.png",
    "image126.jpg",
    "image157.jpg"
  ],
  "PL-VOLT-0121": [
    "image125.jpg",
    "image127.png",
    "image126.jpg"
  ],
  "PL-TIKY-0078": [
    "image125.jpg",
    "image127.png",
    "image126.jpg",
    "image157.jpg"
  ],
  "PL-SALU-0092": [
    "image125.jpg",
    "image127.png",
    "image126.jpg",
    "image157.jpg"
  ],
  "PL-RAPT-0123": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-RAPT-0124": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-RAPT-0125": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-RAPT-0127": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-RAPT-0122": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-RAPT-0126": [
    "image128.jpg",
    "image132.png",
    "image131.jpeg",
    "image130.jpeg"
  ],
  "PL-VOLT-0129": [
    "image76.jpg",
    "image135.jpeg",
    "image134.jpg",
    "image133.jpg"
  ],
  "PL-AMP_-0132": [
    "image77.jpg",
    "image138.jpg",
    "image137.jpg",
    "image136.jpg"
  ],
  "PL-AMP_-0133": [
    "image77.jpg",
    "image138.jpg",
    "image137.jpg",
    "image136.jpg"
  ],
  "PL-AMP_-0134": [
    "image77.jpg",
    "image138.jpg",
    "image137.jpg",
    "image136.jpg"
  ],
  "PL-GLUC-0139": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-GLUC-0140": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-GLUC-0135": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-GLUC-0136": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-GLUC-0137": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-GLUC-0138": [
    "image143.jpg",
    "image73.jpg",
    "image142.jpg",
    "image141.jpg"
  ],
  "PL-DIAN-0169": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0170": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0171": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-FRIT-0188": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-FANT-0075": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-PEPS-0077": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-TIKY-0081": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MIRI-0090": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-SALU-0093": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CUZC-0096": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CUZC-0097": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0143": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0167": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0168": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-FRIT-0187": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-BAND-0243": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-BEST-0245": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-BEST-0246": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-NATU-0338": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-NATU-0339": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-VIVA-0350": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-VIVA-0351": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-INA-0369": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-INA-0370": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-QUAK-0381": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-QUAK-0382": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-INCA-0388": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-INCA-0389": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CAFE-0393": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CAFE-0394": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CAFE-0395": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CAFE-0396": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0409": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0410": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0411": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0414": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0415": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0416": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0418": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0423": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0426": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MALH-0427": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CAMP-0457": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-PICA-0463": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-PICA-0464": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-ANA_-0475": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-ANA_-0476": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MCCO-0477": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-MCCO-0478": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CHOC-0491": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-CHOC-0492": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-BIJO-0494": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-SAM-0495": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-YA_E-0496": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-TOKI-0499": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-AXIO-0504": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-AXIO-0505": [
    "image157.jpg",
    "image162.jpg",
    "image167.jpg",
    "image152.jpg"
  ],
  "PL-DIAN-0160": [
    "image152.jpg",
    "image172.jpg",
    "image171.jpg",
    "image170.jpg"
  ],
  "PL-DIAN-0164": [
    "image152.jpg",
    "image175.png",
    "image174.jpg",
    "image173.jpg"
  ],
  "PL-DIAN-0165": [
    "image152.jpg",
    "image175.png",
    "image174.jpg",
    "image173.jpg"
  ],
  "PL-DIAN-0166": [
    "image152.jpg",
    "image175.png",
    "image174.jpg",
    "image173.jpg"
  ],
  "PL-SENO-0172": [
    "image181.jpg",
    "image185.jpg",
    "image184.jpg",
    "image183.jpg"
  ],
  "PL-SENO-0173": [
    "image181.jpg",
    "image185.jpg",
    "image184.jpg",
    "image183.jpg"
  ],
  "PL-SENO-0174": [
    "image181.jpg",
    "image185.jpg",
    "image184.jpg",
    "image183.jpg"
  ],
  "PL-SENO-0180": [
    "image181.jpg",
    "image185.jpg",
    "image184.jpg",
    "image183.jpg"
  ],
  "PL-SENO-0175": [
    "image190.jpeg",
    "image181.jpg",
    "image189.jpg",
    "image188.jpeg"
  ],
  "PL-SENO-0176": [
    "image190.jpeg",
    "image181.jpg",
    "image189.jpg",
    "image188.jpeg"
  ],
  "PL-SENO-0178": [
    "image181.jpg",
    "image193.jpg",
    "image192.jpg",
    "image191.jpg"
  ],
  "PL-SENO-0179": [
    "image181.jpg",
    "image193.jpg",
    "image192.jpg",
    "image191.jpg"
  ],
  "PL-SENO-0183": [
    "image198.png",
    "image181.jpg",
    "image197.png",
    "image196.jpg"
  ],
  "PL-SENO-0181": [
    "image198.png",
    "image181.jpg",
    "image197.png",
    "image196.jpg"
  ],
  "PL-SENO-0182": [
    "image198.png",
    "image181.jpg",
    "image197.png",
    "image196.jpg"
  ],
  "PL-SENO-0184": [
    "image199.jpeg",
    "image181.jpg"
  ],
  "PL-SENO-0185": [
    "image199.jpeg",
    "image181.jpg"
  ],
  "PL-SENO-0186": [
    "image199.jpeg",
    "image181.jpg"
  ],
  "PL-FRIT-0189": [
    "image202.jpg",
    "image203.jpg"
  ],
  "PL-TORT-0190": [
    "image204.jpg",
    "image207.jpg",
    "image206.jpg",
    "image205.jpg"
  ],
  "PL-TORT-0191": [
    "image204.jpg",
    "image207.jpg",
    "image206.jpg",
    "image205.jpg"
  ],
  "PL-TORT-0192": [
    "image204.jpg",
    "image207.jpg",
    "image206.jpg",
    "image205.jpg"
  ],
  "PL-TORT-0196": [
    "image212.jpeg",
    "image204.jpg",
    "image211.jpeg",
    "image210.jpeg"
  ],
  "PL-TORT-0197": [
    "image212.jpeg",
    "image204.jpg",
    "image211.jpeg",
    "image210.jpeg"
  ],
  "PL-TORT-0193": [
    "image212.jpeg",
    "image204.jpg",
    "image211.jpeg",
    "image210.jpeg"
  ],
  "PL-TORT-0195": [
    "image212.jpeg",
    "image204.jpg",
    "image211.jpeg",
    "image210.jpeg"
  ],
  "PL-TORT-0201": [
    "image216.jpg",
    "image213.jpg",
    "image215.jpg",
    "image214.jpg"
  ],
  "PL-FILL-0202": [
    "image217.jpg",
    "image219.jpg",
    "image218.jpg"
  ],
  "PL-FILL-0203": [
    "image217.jpg",
    "image219.jpg",
    "image218.jpg"
  ],
  "PL-BOCA-0205": [
    "image225.jpg",
    "image220.jpg",
    "image224.jpg",
    "image223.jpg"
  ],
  "PL-BOCA-0204": [
    "image225.jpg",
    "image220.jpg",
    "image224.jpg",
    "image223.jpg"
  ],
  "PL-BOCA-0206": [
    "image225.jpg",
    "image220.jpg",
    "image224.jpg",
    "image223.jpg"
  ],
  "PL-BOCA-0208": [
    "image225.jpg",
    "image220.jpg",
    "image224.jpg",
    "image223.jpg"
  ],
  "PL-BOCA-0209": [
    "image220.jpg",
    "image227.jpg",
    "image226.jpg"
  ],
  "PL-BOCA-0210": [
    "image220.jpg",
    "image227.jpg",
    "image226.jpg"
  ],
  "PL-BOCA-0212": [
    "image220.jpg",
    "image229.jpg",
    "image228.jpg"
  ],
  "PL-YUMM-0221": [
    "image243.png",
    "image231.jpg",
    "image242.jpeg",
    "image241.jpg"
  ],
  "PL-YUMM-0222": [
    "image243.png",
    "image231.jpg",
    "image242.jpeg",
    "image241.jpg"
  ],
  "PL-YUMM-0223": [
    "image243.png",
    "image231.jpg",
    "image242.jpeg",
    "image241.jpg"
  ],
  "PL-YUMM-0224": [
    "image243.png",
    "image231.jpg",
    "image242.jpeg",
    "image241.jpg"
  ],
  "PL-CHIK-0226": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0227": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0228": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0229": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0230": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0231": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0232": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CHIK-0233": [
    "image244.jpg",
    "image246.jpg",
    "image245.jpg",
    "image247.jpg"
  ],
  "PL-CAN_-0235": [
    "image252.png",
    "image255.jpg",
    "image254.jpg",
    "image253.jpg"
  ],
  "PL-POZU-0240": [
    "image256.jpg",
    "image259.png",
    "image258.jpg",
    "image257.jpg"
  ],
  "PL-GRAN-0242": [
    "image260.jpg",
    "image263.jpg",
    "image262.jpg",
    "image261.jpg"
  ],
  "PL-BEST-0244": [
    "image266.jpeg",
    "image268.png",
    "image267.png"
  ],
  "PL-GUAN-0248": [
    "image269.jpg",
    "image271.jpg",
    "image270.jpg"
  ],
  "PL-GUAN-0249": [
    "image269.jpg",
    "image271.jpg",
    "image270.jpg"
  ],
  "PL-DELY-0251": [
    "image273.png",
    "image272.png",
    "image276.jpg",
    "image275.jpg"
  ],
  "PL-DELY-0252": [
    "image273.png",
    "image272.png",
    "image276.jpg",
    "image275.jpg"
  ],
  "PL-DE_M-0253": [
    "image277.png",
    "image27.jpg"
  ],
  "PL-VIVA-0254": [
    "image280.jpg",
    "image286.jpg",
    "image285.jpg"
  ],
  "PL-VIVA-0255": [
    "image280.jpg",
    "image286.jpg",
    "image285.jpg"
  ],
  "PL-VIVA-0256": [
    "image280.jpg",
    "image288.jpeg",
    "image287.jpeg"
  ],
  "PL-VIVA-0257": [
    "image280.jpg",
    "image288.jpeg",
    "image287.jpeg"
  ],
  "PL-LIDO-0260": [
    "image289.jpeg",
    "image281.jpg",
    "image292.png",
    "image291.jpeg"
  ],
  "PL-LIDO-0258": [
    "image289.jpeg",
    "image281.jpg",
    "image292.png",
    "image291.jpeg"
  ],
  "PL-LIDO-0259": [
    "image289.jpeg",
    "image281.jpg",
    "image292.png",
    "image291.jpeg"
  ],
  "PL-LIDO-0264": [
    "image289.jpeg",
    "image281.jpg",
    "image292.png",
    "image291.jpeg"
  ],
  "PL-LIDO-0263": [
    "image293.png",
    "image297.png",
    "image296.png",
    "image295.png"
  ],
  "PL-LIDO-0265": [
    "image293.png",
    "image297.png",
    "image296.png",
    "image295.png"
  ],
  "PL-LIDO-0262": [
    "image293.png",
    "image297.png",
    "image296.png",
    "image295.png"
  ],
  "PL-LIDO-0266": [
    "image293.png",
    "image297.png",
    "image296.png",
    "image295.png"
  ],
  "PL-LIDO-0267": [
    "image293.png",
    "image297.png",
    "image296.png",
    "image295.png"
  ],
  "PL-LIDO-0269": [
    "image298.jpg",
    "image300.jpg",
    "image299.jpg"
  ],
  "PL-LIDO-0270": [
    "image298.jpg",
    "image300.jpg",
    "image299.jpg",
    "image306.png"
  ],
  "PL-LIDO-0268": [
    "image298.jpg",
    "image300.jpg",
    "image299.jpg"
  ],
  "PL-FRUS-0275": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-FRUS-0277": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-DE_M-0021": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-FRUS-0271": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-FRUS-0276": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-FRUS-0278": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-TABO-0306": [
    "image306.png",
    "image301.png",
    "image305.png",
    "image304.png"
  ],
  "PL-SANT-0281": [
    "image310.png",
    "image311.png"
  ],
  "PL-SANT-0280": [
    "image310.png",
    "image311.png"
  ],
  "PL-DE_M-0282": [
    "image317.jpg",
    "image312.jpg",
    "image316.jpg",
    "image315.jpg"
  ],
  "PL-DE_M-0283": [
    "image317.jpg",
    "image312.jpg",
    "image316.jpg",
    "image315.jpg"
  ],
  "PL-DE_M-0284": [
    "image317.jpg",
    "image312.jpg",
    "image316.jpg",
    "image315.jpg"
  ],
  "PL-DE_M-0285": [
    "image317.jpg",
    "image312.jpg",
    "image316.jpg",
    "image315.jpg"
  ],
  "PL-DE_M-0286": [
    "image317.jpg",
    "image312.jpg",
    "image316.jpg",
    "image315.jpg"
  ],
  "PL-DE_M-0287": [
    "image27.jpg",
    "image320.jpg",
    "image319.png",
    "image318.png"
  ],
  "PL-DE_M-0289": [
    "image27.jpg",
    "image320.jpg",
    "image319.png",
    "image318.png"
  ],
  "PL-SUPE-0291": [
    "image321.jpg",
    "image323.jpg",
    "image322.jpg",
    "image282.jpg"
  ],
  "PL-SUPE-0290": [
    "image321.jpg",
    "image323.jpg",
    "image322.jpg",
    "image282.jpg"
  ],
  "PL-SUPE-0292": [
    "image321.jpg",
    "image323.jpg",
    "image322.jpg",
    "image282.jpg"
  ],
  "PL-SUPE-0293": [
    "image324.jpg",
    "image327.png",
    "image326.png",
    "image325.png"
  ],
  "PL-SUPE-0295": [
    "image324.jpg",
    "image327.png",
    "image326.png",
    "image325.png"
  ],
  "PL-SUPE-0294": [
    "image324.jpg",
    "image327.png",
    "image326.png",
    "image325.png"
  ],
  "PL-TIO_-0297": [
    "image278.jpg",
    "image329.jpg",
    "image328.jpg"
  ],
  "PL-TIO_-0299": [
    "image278.jpg",
    "image332.jpg",
    "image331.jpg",
    "image330.jpg"
  ],
  "PL-TIO_-0300": [
    "image278.jpg",
    "image332.jpg",
    "image331.jpg",
    "image330.jpg"
  ],
  "PL-TABO-0305": [
    "image283.png",
    "image334.png",
    "image333.png"
  ],
  "PL-TABO-0302": [
    "image283.png",
    "image334.png",
    "image333.png"
  ],
  "PL-TABO-0307": [
    "image283.png",
    "image334.png",
    "image333.png",
    "image617.png"
  ],
  "PL-TABO-0314": [
    "image283.png",
    "image334.png",
    "image333.png",
    "image338.png"
  ],
  "PL-TABO-0309": [
    "image283.png",
    "image336.png",
    "image335.png"
  ],
  "PL-TABO-0311": [
    "image283.png",
    "image336.png",
    "image335.png",
    "image617.png"
  ],
  "PL-TABO-0312": [
    "image283.png",
    "image338.png",
    "image337.png"
  ],
  "PL-TABO-0313": [
    "image283.png",
    "image338.png",
    "image337.png"
  ],
  "PL-TABO-0315": [
    "image283.png",
    "image338.png",
    "image337.png"
  ],
  "PL-PAN_-0318": [
    "image339.jpeg",
    "image342.jpeg",
    "image341.jpeg",
    "image340.jpeg"
  ],
  "PL-PAN_-0319": [
    "image339.jpeg",
    "image342.jpeg",
    "image341.jpeg",
    "image340.jpeg"
  ],
  "PL-PAN_-0320": [
    "image339.jpeg",
    "image342.jpeg",
    "image341.jpeg",
    "image340.jpeg"
  ],
  "PL-PAN_-0317": [
    "image339.jpeg",
    "image342.jpeg",
    "image341.jpeg",
    "image340.jpeg"
  ],
  "PL-PAN_-0322": [
    "image343.jpeg",
    "image345.jpeg",
    "image344.jpeg"
  ],
  "PL-PAN_-0321": [
    "image343.jpeg",
    "image345.jpeg",
    "image344.jpeg"
  ],
  "PL-PAN_-0323": [
    "image343.jpeg",
    "image345.jpeg",
    "image344.jpeg"
  ],
  "PL-SANS-0324": [
    "image346.jpeg",
    "image347.jpeg"
  ],
  "PL-SANS-0325": [
    "image346.jpeg",
    "image347.jpeg"
  ],
  "PL-LAS_-0326": [
    "image348.png",
    "image349.jpg"
  ],
  "PL-DE_M-0328": [
    "image350.jpg",
    "image353.jpg",
    "image352.jpg",
    "image351.jpg"
  ],
  "PL-DUCA-0329": [
    "image366.jpg",
    "image370.jpg",
    "image369.jpg",
    "image368.jpg"
  ],
  "PL-DUCA-0330": [
    "image366.jpg",
    "image370.jpg",
    "image369.jpg",
    "image368.jpg"
  ],
  "PL-DUCA-0331": [
    "image366.jpg",
    "image370.jpg",
    "image369.jpg",
    "image368.jpg"
  ],
  "PL-DUCA-0332": [
    "image366.jpg",
    "image370.jpg",
    "image369.jpg",
    "image368.jpg"
  ],
  "PL-DUCA-0333": [
    "image371.jpg",
    "image374.png",
    "image373.png",
    "image372.jpg"
  ],
  "PL-DUCA-0334": [
    "image371.jpg",
    "image374.png",
    "image373.png",
    "image372.jpg"
  ],
  "PL-DE_M-0337": [
    "image375.jpg",
    "image376.jpg"
  ],
  "PL-NATU-0340": [
    "image377.png",
    "image381.jpeg",
    "image380.png",
    "image379.png"
  ],
  "PL-NATU-0341": [
    "image377.png",
    "image381.jpeg",
    "image380.png",
    "image379.png"
  ],
  "PL-MALH-0422": [
    "image377.png",
    "image381.jpeg",
    "image380.png",
    "image379.png"
  ],
  "PL-WORL-0342": [
    "image382.jpg"
  ],
  "PL-FRUS-0343": [
    "image382.jpg"
  ],
  "PL-FRUS-0344": [
    "image383.png",
    "image387.png",
    "image386.png",
    "image385.png"
  ],
  "PL-FRUS-0345": [
    "image383.png",
    "image387.png",
    "image386.png",
    "image385.png"
  ],
  "PL-FRUS-0346": [
    "image383.png",
    "image387.png",
    "image386.png",
    "image385.png"
  ],
  "PL-FRUS-0347": [
    "image383.png",
    "image387.png",
    "image386.png",
    "image385.png"
  ],
  "PL-DE_M-0348": [
    "image27.jpg",
    "image388.jpg"
  ],
  "PL-VIVA-0352": [
    "image389.png",
    "image390.png"
  ],
  "PL-VIVA-0349": [
    "image389.png",
    "image390.png"
  ],
  "PL-FRUS-0354": [
    "image395.png",
    "image394.png",
    "image393.png",
    "image392.png"
  ],
  "PL-FRUS-0355": [
    "image395.png",
    "image394.png",
    "image393.png",
    "image392.png"
  ],
  "PL-FRUS-0353": [
    "image395.png",
    "image394.png",
    "image393.png",
    "image392.png"
  ],
  "PL-FRUS-0356": [
    "image395.png",
    "image394.png",
    "image393.png",
    "image392.png"
  ],
  "PL-FRUS-0357": [
    "image395.png",
    "image394.png",
    "image393.png",
    "image392.png"
  ],
  "PL-INA-0358": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0359": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0360": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0361": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0363": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0364": [
    "image396.jpg",
    "image400.jpg",
    "image399.jpg",
    "image398.jpg"
  ],
  "PL-INA-0365": [
    "image396.jpg",
    "image404.jpg",
    "image403.jpg",
    "image402.jpg"
  ],
  "PL-INA-0362": [
    "image396.jpg",
    "image404.jpg",
    "image403.jpg",
    "image402.jpg"
  ],
  "PL-INA-0366": [
    "image409.jpg",
    "image405.jpg",
    "image408.jpg",
    "image407.jpg"
  ],
  "PL-INA-0367": [
    "image409.jpg",
    "image405.jpg",
    "image408.jpg",
    "image407.jpg"
  ],
  "PL-INA-0368": [
    "image409.jpg",
    "image405.jpg",
    "image408.jpg",
    "image407.jpg"
  ],
  "PL-CANT-0371": [
    "image410.jpg",
    "image411.jpg"
  ],
  "PL-EL_A-0372": [
    "image412.png"
  ],
  "PL-GALL-0376": [
    "image418.jpg",
    "image413.jpg",
    "image417.jpg",
    "image416.jpeg"
  ],
  "PL-SAN_-0375": [
    "image418.jpg",
    "image413.jpg",
    "image417.jpg",
    "image416.jpeg"
  ],
  "PL-INCA-0383": [
    "image421.jpg",
    "image423.jpg",
    "image422.jpg"
  ],
  "PL-LA_R-0384": [
    "image424.png"
  ],
  "PL-CAFE-0385": [
    "image425.jpg",
    "image428.jpeg",
    "image427.jpg",
    "image426.jpg"
  ],
  "PL-CAFE-0387": [
    "image425.jpg",
    "image428.jpeg",
    "image427.jpg",
    "image426.jpg"
  ],
  "PL-CAFE-0386": [
    "image425.jpg",
    "image428.jpeg",
    "image427.jpg",
    "image426.jpg"
  ],
  "PL-INCA-0390": [
    "image429.jpg",
    "image433.png",
    "image432.jpg",
    "image431.jpg"
  ],
  "PL-INCA-0391": [
    "image429.jpg",
    "image433.png",
    "image432.jpg",
    "image431.jpg"
  ],
  "PL-INCA-0392": [
    "image429.jpg",
    "image433.png",
    "image432.jpg",
    "image431.jpg"
  ],
  "PL-LA_J-0399": [
    "image429.jpg",
    "image433.png",
    "image432.jpg",
    "image431.jpg"
  ],
  "PL-CAFE-0398": [
    "image437.png",
    "image438.png"
  ],
  "PL-CAFE-0397": [
    "image437.png",
    "image438.png"
  ],
  "PL-MALH-0403": [
    "image446.jpg",
    "image441.jpg",
    "image445.jpg",
    "image444.jpg"
  ],
  "PL-MALH-0405": [
    "image447.jpg",
    "image449.jpg",
    "image448.jpg",
    "image458.jpeg"
  ],
  "PL-MALH-0406": [
    "image447.jpg",
    "image449.jpg",
    "image448.jpg"
  ],
  "PL-MALH-0407": [
    "image447.jpg",
    "image449.jpg",
    "image448.jpg"
  ],
  "PL-MALH-0408": [
    "image447.jpg",
    "image449.jpg",
    "image448.jpg",
    "image450.jpg"
  ],
  "PL-MALH-0412": [
    "image450.jpg",
    "image454.png",
    "image453.jpg",
    "image452.jpg"
  ],
  "PL-MALH-0413": [
    "image455.jpg",
    "image457.jpg",
    "image456.jpg"
  ],
  "PL-MALH-0417": [
    "image458.jpeg",
    "image460.jpeg",
    "image459.png"
  ],
  "PL-MALH-0419": [
    "image461.png",
    "image463.png",
    "image462.png"
  ],
  "PL-MALH-0420": [
    "image461.png",
    "image463.png",
    "image462.png"
  ],
  "PL-MALH-0421": [
    "image461.png",
    "image463.png",
    "image462.png"
  ],
  "PL-MALH-0424": [
    "image467.jpg",
    "image470.jpg",
    "image469.jpg",
    "image468.jpg"
  ],
  "PL-MALH-0425": [
    "image467.jpg",
    "image470.jpg",
    "image469.jpg",
    "image468.jpg"
  ],
  "PL-MALH-0428": [
    "image471.jpg",
    "image473.jpg",
    "image472.jpg"
  ],
  "PL-MALH-0429": [
    "image471.jpg",
    "image473.jpg",
    "image472.jpg"
  ],
  "PL-MALH-0430": [
    "image471.jpg",
    "image473.jpg",
    "image472.jpg"
  ],
  "PL-MAGG-0434": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0431": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0432": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0433": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0435": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0436": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0437": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-MAGG-0438": [
    "image479.jpg",
    "image478.jpg",
    "image474.jpeg",
    "image477.jpeg"
  ],
  "PL-KERN-0057": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-KERN-0058": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-KERN-0059": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-KERN-0060": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-KERN-0061": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-KERN-0062": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-NATU-0439": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-NATU-0440": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-NATU-0441": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-NATU-0442": [
    "image482.jpg",
    "image486.jpeg",
    "image485.jpg",
    "image484.jpg"
  ],
  "PL-LAKY-0449": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0443": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0444": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0445": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0446": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0447": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LAKY-0448": [
    "image492.jpg",
    "image487.jpg",
    "image491.jpg",
    "image490.jpg"
  ],
  "PL-LA_S-0450": [
    "image495.jpg",
    "image499.jpg",
    "image498.jpg",
    "image497.jpg"
  ],
  "PL-LA_S-0452": [
    "image495.jpg",
    "image499.jpg",
    "image498.jpg",
    "image497.jpg"
  ],
  "PL-LA_S-0451": [
    "image495.jpg",
    "image499.jpg",
    "image498.jpg",
    "image497.jpg"
  ],
  "PL-LA_S-0453": [
    "image495.jpg",
    "image499.jpg",
    "image498.jpg",
    "image497.jpg"
  ],
  "PL-CAMP-0454": [
    "image500.jpg",
    "image503.jpg",
    "image502.jpg",
    "image501.jpeg"
  ],
  "PL-CAMP-0455": [
    "image500.jpg",
    "image503.jpg",
    "image502.jpg",
    "image501.jpeg"
  ],
  "PL-CAMP-0456": [
    "image500.jpg",
    "image503.jpg",
    "image502.jpg",
    "image501.jpeg"
  ],
  "PL-JUTI-0458": [
    "image504.jpg",
    "image505.png"
  ],
  "PL-LA_P-0467": [
    "image510.png",
    "image512.png",
    "image511.png"
  ],
  "PL-LA_P-0465": [
    "image510.png",
    "image512.png",
    "image511.png"
  ],
  "PL-LA_P-0466": [
    "image510.png",
    "image512.png",
    "image511.png"
  ],
  "PL-VIVA-0468": [
    "image515.jpg",
    "image514.jpg",
    "image513.jpg",
    "image351.jpg"
  ],
  "PL-VIVA-0469": [
    "image515.jpg",
    "image514.jpg",
    "image513.jpg",
    "image351.jpg"
  ],
  "PL-VIVA-0470": [
    "image515.jpg",
    "image514.jpg",
    "image513.jpg",
    "image351.jpg"
  ],
  "PL-NASS-0471": [
    "image516.png"
  ],
  "PL-PICA-0462": [
    "image517.jpg",
    "image520.jpeg",
    "image519.jpg",
    "image518.jpg"
  ],
  "PL-B_B-0472": [
    "image517.jpg",
    "image520.jpeg",
    "image519.jpg",
    "image518.jpg"
  ],
  "PL-B_B-0473": [
    "image517.jpg",
    "image520.jpeg",
    "image519.jpg",
    "image518.jpg"
  ],
  "PL-B_B-0474": [
    "image517.jpg",
    "image520.jpeg",
    "image519.jpg",
    "image518.jpg"
  ],
  "PL-LIZA-0481": [
    "image524.png",
    "image526.jpeg",
    "image525.jpeg"
  ],
  "PL-MCCO-0479": [
    "image524.png",
    "image526.jpeg",
    "image525.jpeg"
  ],
  "PL-MCCO-0480": [
    "image524.png",
    "image526.jpeg",
    "image525.jpeg"
  ],
  "PL-B_B-0482": [
    "image527.jpg",
    "image529.jpeg",
    "image528.png"
  ],
  "PL-DONA-0483": [
    "image527.jpg",
    "image529.jpeg",
    "image528.png"
  ],
  "PL-CAST-0484": [
    "image534.jpg",
    "image530.png",
    "image533.jpg",
    "image532.jpg"
  ],
  "PL-GRAN-0485": [
    "image535.jpeg",
    "image538.jpeg",
    "image537.png",
    "image536.jpeg"
  ],
  "PL-CHOC-0487": [
    "image535.jpeg",
    "image538.jpeg",
    "image537.png",
    "image536.jpeg"
  ],
  "PL-CHOC-0488": [
    "image535.jpeg",
    "image538.jpeg",
    "image537.png",
    "image536.jpeg"
  ],
  "PL-CHOC-0489": [
    "image535.jpeg",
    "image538.jpeg",
    "image537.png",
    "image536.jpeg"
  ],
  "PL-MELH-0490": [
    "image535.jpeg",
    "image538.jpeg",
    "image537.png",
    "image536.jpeg"
  ],
  "PL-CORO-0493": [
    "image542.jpeg"
  ],
  "PL-YA_E-0497": [
    "image551.jpeg",
    "image552.jpeg"
  ],
  "PL-YA_E-0498": [
    "image551.jpeg",
    "image552.jpeg"
  ],
  "PL-PROT-0500": [
    "image559.jpg",
    "image554.jpg",
    "image558.jpg",
    "image557.jpg"
  ],
  "PL-DONA-0501": [
    "image562.jpg",
    "image563.jpg"
  ],
  "PL-DONA-0502": [
    "image562.jpg",
    "image563.jpg"
  ],
  "PL-AXIO-0503": [
    "image564.png",
    "image566.jpg",
    "image565.jpg"
  ],
  "PL-AXIO-0506": [
    "image567.jpg",
    "image564.png"
  ],
  "PL-AMBA-0507": [
    "image568.png",
    "image569.png"
  ],
  "PL-POTE-0508": [
    "image568.png",
    "image569.png"
  ],
  "PL-VIVA-0509": [
    "image570.jpg",
    "image571.jpg"
  ],
  "PL-DOLO-0511": [
    "image572.jpg",
    "image573.jpg"
  ],
  "PL-DOLO-0510": [
    "image572.jpg",
    "image573.jpg"
  ],
  "PL-NEUR-0512": [
    "image574.jpg",
    "image575.jpg"
  ],
  "PL-NERV-0513": [
    "image574.jpg",
    "image575.jpg"
  ],
  "PL-NEUR-0516": [
    "image576.jpg",
    "image579.jpg",
    "image578.jpg",
    "image577.jpg"
  ],
  "PL-NEUR-0517": [
    "image576.jpg",
    "image579.jpg",
    "image578.jpg",
    "image577.jpg"
  ],
  "PL-NEUR-0514": [
    "image576.jpg",
    "image579.jpg",
    "image578.jpg",
    "image577.jpg"
  ],
  "PL-NEUR-0515": [
    "image576.jpg",
    "image579.jpg",
    "image578.jpg",
    "image577.jpg"
  ],
  "PL-NEUR-0521": [
    "image580.jpg",
    "image583.jpg",
    "image582.jpg",
    "image581.jpg"
  ],
  "PL-NEUR-0518": [
    "image580.jpg",
    "image583.jpg",
    "image582.jpg",
    "image581.jpg"
  ],
  "PL-NEUR-0519": [
    "image580.jpg",
    "image583.jpg",
    "image582.jpg",
    "image581.jpg"
  ],
  "PL-NEUR-0520": [
    "image580.jpg",
    "image583.jpg",
    "image582.jpg",
    "image581.jpg"
  ],
  "PL-SUKR-0524": [
    "image589.jpg",
    "image584.jpg",
    "image588.jpg",
    "image587.jpg"
  ],
  "PL-SUKR-0525": [
    "image589.jpg",
    "image584.jpg",
    "image588.jpg",
    "image587.jpg"
  ],
  "PL-SUKR-0523": [
    "image589.jpg",
    "image584.jpg",
    "image588.jpg",
    "image587.jpg"
  ],
  "PL-SUKR-0526": [
    "image589.jpg",
    "image584.jpg",
    "image588.jpg",
    "image587.jpg"
  ],
  "PL-SUKR-0528": [
    "image590.jpg",
    "image592.jpg",
    "image591.jpg"
  ],
  "PL-SUKR-0527": [
    "image590.jpg",
    "image592.jpg",
    "image591.jpg"
  ],
  "PL-VITA-0534": [
    "image593.jpg",
    "image597.jpg",
    "image596.jpg",
    "image595.jpg"
  ],
  "PL-VITA-0529": [
    "image593.jpg",
    "image597.jpg",
    "image596.jpg",
    "image595.jpg"
  ],
  "PL-RABA-0535": [
    "image598.jpg",
    "image600.jpeg",
    "image599.jpg"
  ],
  "PL-BACA-0536": [
    "image598.jpg",
    "image600.jpeg",
    "image599.jpg"
  ],
  "PL-BACA-0537": [
    "image598.jpg",
    "image600.jpeg",
    "image599.jpg"
  ],
  "PL-ULTR-0538": [
    "image601.jpg",
    "image602.jpg"
  ],
  "PL-FOSK-0541": [
    "image603.png"
  ],
  "PL-FOSK-0542": [
    "image603.png"
  ],
  "PL-FOSK-0543": [
    "image603.png"
  ],
  "PL-FOSK-0545": [
    "image603.png",
    "image604.jpg",
    "image607.png",
    "image606.jpeg"
  ],
  "PL-ULTR-0549": [
    "image603.png",
    "image604.jpg",
    "image607.png",
    "image606.jpeg"
  ],
  "PL-FOSK-0544": [
    "image604.jpg",
    "image607.png",
    "image606.jpeg",
    "image605.jpg"
  ],
  "PL-FOSK-0546": [
    "image604.jpg",
    "image607.png",
    "image606.jpeg",
    "image605.jpg"
  ],
  "PL-PULM-0547": [
    "image608.jpg",
    "image609.png"
  ],
  "PL-TRIC-0548": [
    "image608.jpg",
    "image609.png"
  ],
  "PL-ESTR-0550": [
    "image610.jpg",
    "image611.jpg"
  ],
  "PL-FRUS-0553": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0554": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0555": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0556": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0557": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0552": [
    "image617.png",
    "image612.png",
    "image616.png",
    "image615.png"
  ],
  "PL-FRUS-0561": [
    "image618.jpg",
    "image621.jpeg",
    "image620.png",
    "image619.png"
  ],
  "PL-VIVA-0558": [
    "image618.jpg",
    "image621.jpeg",
    "image620.png",
    "image619.png"
  ],
  "PL-FRUS-0559": [
    "image618.jpg",
    "image621.jpeg",
    "image620.png",
    "image619.png"
  ],
  "PL-FRUS-0560": [
    "image618.jpg",
    "image621.jpeg",
    "image620.png",
    "image619.png"
  ],
  "PL-POLL-0565": [
    "image622.jpeg",
    "image625.png",
    "image624.png",
    "image623.png"
  ],
  "PL-POLL-0563": [
    "image622.jpeg",
    "image625.png",
    "image624.png",
    "image623.png"
  ],
  "PL-VIVA-0568": [
    "image626.jpg",
    "image629.jpg",
    "image628.png",
    "image627.jpg"
  ],
  "PL-RIO_-0569": [
    "image626.jpg",
    "image629.jpg",
    "image628.png",
    "image627.jpg"
  ],
  "PL-VIVA-0567": [
    "image626.jpg",
    "image629.jpg",
    "image628.png",
    "image627.jpg"
  ],
  "PL-RIO_-0570": [
    "image626.jpg",
    "image629.jpg",
    "image628.png",
    "image627.jpg"
  ],
  "PL-VIVA-0571": [
    "image570.jpg",
    "image630.jpg"
  ],
  "PL-VIVA-0573": [
    "image570.jpg",
    "image632.jpg",
    "image631.jpg"
  ],
  "PL-VIVA-0572": [
    "image570.jpg",
    "image632.jpg",
    "image631.jpg"
  ],
  "PL-VIVA-0574": [
    "image570.jpg",
    "image634.jpg",
    "image633.jpg"
  ],
  "PL-VIVA-0575": [
    "image570.jpg",
    "image634.jpg",
    "image633.jpg"
  ],
  "PL-FRUS-0576": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ],
  "PL-FRUS-0577": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ],
  "PL-FRUS-0578": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ],
  "PL-FRUS-0579": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ],
  "PL-FRUS-0580": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ],
  "PL-FRUS-0581": [
    "image640.png",
    "image635.png",
    "image639.png",
    "image638.png"
  ]
};

async function getProductIdBySku(sku: string): Promise<string | null> {
  const res = await fetch(
    `${API_URL}/products?search=${encodeURIComponent(sku)}&limit=1&status=ALL`,
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
      if (!fs.existsSync(filePath)) continue;
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

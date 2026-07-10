import type { AdmissionFirstSubject, AdmissionRecord, AdmissionTrack } from "./admission-data";

type OfficialCategory = "理工/物理类" | "文史/历史类" | "综合改革";

type Official2025Row = {
  province: string;
  major: string;
  category: OfficialCategory;
  batch: string;
  enrollment: number;
  highest: number;
  lowest: number;
  lowestRank?: number;
};

const collegeName = "南京医科大学康达学院";
const sourceTitle = "南京医科大学康达学院2025年分省分专业录取分数线（普高招生）";
const sourceUrl = "https://kdzs.njmu.edu.cn/2026/0609/c18067a302852/page.htm";

const official2025Rows: readonly Official2025Row[] = [
  { province: "安徽", major: "临床医学", category: "理工/物理类", batch: "普通本科批", enrollment: 6, highest: 553, lowest: 509, lowestRank: 121838 },
  { province: "安徽", major: "预防医学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 508, lowest: 497, lowestRank: 139469 },
  { province: "安徽", major: "医学影像技术", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 497, lowest: 497, lowestRank: 139469 },
  { province: "安徽", major: "康复治疗学", category: "理工/物理类", batch: "普通本科批", enrollment: 3, highest: 512, lowest: 492, lowestRank: 146903 },
  { province: "安徽", major: "制药工程", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 492, lowest: 491, lowestRank: 148355 },
  { province: "安徽", major: "医学信息工程", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 492, lowest: 489, lowestRank: 151358 },
  { province: "安徽", major: "护理学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 500, lowest: 494, lowestRank: 143937 },
  { province: "安徽", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 527, lowest: 527, lowestRank: 97676 },
  { province: "安徽", major: "护理学", category: "文史/历史类", batch: "普通本科批", enrollment: 1, highest: 496, lowest: 496, lowestRank: 35339 },

  { province: "福建", major: "临床医学", category: "理工/物理类", batch: "普通类本科批", enrollment: 4, highest: 498, lowest: 492, lowestRank: 76112 },
  { province: "福建", major: "预防医学", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 488, lowest: 485, lowestRank: 81945 },
  { province: "福建", major: "卫生检验与检疫", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 496, lowest: 481, lowestRank: 85345 },
  { province: "福建", major: "康复治疗学", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 484, lowest: 482, lowestRank: 84464 },
  { province: "福建", major: "药学", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 484, lowest: 483, lowestRank: 83635 },
  { province: "福建", major: "制药工程", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 486, lowest: 482, lowestRank: 84464 },
  { province: "福建", major: "护理学", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 494, lowest: 491, lowestRank: 76979 },
  { province: "福建", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 489, lowest: 484, lowestRank: 82760 },
  { province: "福建", major: "健康服务与管理", category: "理工/物理类", batch: "普通类本科批", enrollment: 2, highest: 500, lowest: 488, lowestRank: 79451 },
  { province: "福建", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "普通类本科批", enrollment: 2, highest: 477, lowest: 466, lowestRank: 21897 },
  { province: "福建", major: "英语", category: "文史/历史类", batch: "普通类本科批", enrollment: 1, highest: 469, lowest: 469, lowestRank: 21192 },

  { province: "甘肃", major: "临床医学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 458, lowest: 431, lowestRank: 63079 },
  { province: "甘肃", major: "药学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 422, lowest: 422, lowestRank: 68229 },
  { province: "甘肃", major: "护理学", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 431, lowest: 431, lowestRank: 63079 },

  { province: "广东", major: "临床医学", category: "理工/物理类", batch: "本科", enrollment: 6, highest: 526, lowest: 516, lowestRank: 136896 },
  { province: "广东", major: "预防医学", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 513, lowest: 502, lowestRank: 162034 },
  { province: "广东", major: "卫生检验与检疫", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 501, lowest: 496, lowestRank: 173027 },
  { province: "广东", major: "医学影像技术", category: "理工/物理类", batch: "本科", enrollment: 3, highest: 514, lowest: 504, lowestRank: 158421 },
  { province: "广东", major: "医学检验技术", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 511, lowest: 494, lowestRank: 176624 },
  { province: "广东", major: "康复治疗学", category: "理工/物理类", batch: "本科", enrollment: 5, highest: 506, lowest: 494, lowestRank: 176624 },
  { province: "广东", major: "药学", category: "理工/物理类", batch: "本科", enrollment: 6, highest: 515, lowest: 496, lowestRank: 173027 },
  { province: "广东", major: "制药工程", category: "理工/物理类", batch: "本科", enrollment: 8, highest: 498, lowest: 494, lowestRank: 176624 },
  { province: "广东", major: "医学信息工程", category: "理工/物理类", batch: "本科", enrollment: 3, highest: 492, lowest: 487, lowestRank: 189396 },
  { province: "广东", major: "护理学", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 519, lowest: 491, lowestRank: 65981 },
  { province: "广东", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "本科", enrollment: 6, highest: 510, lowest: 486, lowestRank: 70493 },
  { province: "广东", major: "医疗保险", category: "文史/历史类", batch: "本科", enrollment: 4, highest: 508, lowest: 489, lowestRank: 185694 },
  { province: "广东", major: "健康服务与管理", category: "文史/历史类", batch: "本科", enrollment: 4, highest: 516, lowest: 486, lowestRank: 191188 },
  { province: "广东", major: "英语", category: "文史/历史类", batch: "本科", enrollment: 3, highest: 513, lowest: 511, lowestRank: 49666 },

  { province: "贵州", major: "临床医学", category: "理工/物理类", batch: "本科", enrollment: 8, highest: 499, lowest: 488, lowestRank: 61754 },
  { province: "贵州", major: "预防医学", category: "理工/物理类", batch: "本科", enrollment: 7, highest: 429, lowest: 418, lowestRank: 129874 },
  { province: "贵州", major: "医学影像技术", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 443, lowest: 441, lowestRank: 106476 },
  { province: "贵州", major: "医学检验技术", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 450, lowest: 444, lowestRank: 103365 },
  { province: "贵州", major: "康复治疗学", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 472, lowest: 435, lowestRank: 112602 },
  { province: "贵州", major: "药学", category: "理工/物理类", batch: "本科", enrollment: 10, highest: 433, lowest: 417, lowestRank: 130882 },
  { province: "贵州", major: "制药工程", category: "理工/物理类", batch: "本科", enrollment: 10, highest: 424, lowest: 404, lowestRank: 143314 },
  { province: "贵州", major: "医学信息工程", category: "理工/物理类", batch: "本科", enrollment: 5, highest: 420, lowest: 414, lowestRank: 133921 },
  { province: "贵州", major: "护理学", category: "理工/物理类", batch: "本科", enrollment: 11, highest: 458, lowest: 433, lowestRank: 114632 },
  { province: "贵州", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "本科", enrollment: 6, highest: 422, lowest: 413, lowestRank: 134931 },
  { province: "贵州", major: "医疗保险", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 420, lowest: 418, lowestRank: 129874 },
  { province: "贵州", major: "健康服务与管理", category: "理工/物理类", batch: "本科", enrollment: 4, highest: 444, lowest: 423, lowestRank: 124735 },
  { province: "贵州", major: "医疗产品管理", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 437, lowest: 425, lowestRank: 122735 },
  { province: "贵州", major: "护理学", category: "文史/历史类", batch: "本科", enrollment: 4, highest: 466, lowest: 462, lowestRank: 37600 },
  { province: "贵州", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "本科", enrollment: 6, highest: 479, lowest: 469, lowestRank: 34503 },
  { province: "贵州", major: "医疗保险", category: "文史/历史类", batch: "本科", enrollment: 3, highest: 481, lowest: 476, lowestRank: 31499 },
  { province: "贵州", major: "健康服务与管理", category: "文史/历史类", batch: "本科", enrollment: 6, highest: 479, lowest: 473, lowestRank: 32773 },
  { province: "贵州", major: "医疗产品管理", category: "文史/历史类", batch: "本科", enrollment: 5, highest: 491, lowest: 471, lowestRank: 33608 },
  { province: "贵州", major: "英语", category: "文史/历史类", batch: "本科", enrollment: 7, highest: 482, lowest: 470, lowestRank: 34039 },

  { province: "河南", major: "临床医学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 552, lowest: 550, lowestRank: 117829 },
  { province: "河南", major: "医学信息工程", category: "理工/物理类", batch: "普通本科批", enrollment: 4, highest: 530, lowest: 526, lowestRank: 160378 },
  { province: "河南", major: "护理学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 500, lowest: 495, lowestRank: 219377 },
  { province: "河南", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 482, lowest: 482, lowestRank: 244712 },
  { province: "河南", major: "健康服务与管理", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 485, lowest: 485, lowestRank: 238824 },
  { province: "河南", major: "护理学", category: "文史/历史类", batch: "普通本科批", enrollment: 2, highest: 521, lowest: 517, lowestRank: 48853 },
  { province: "河南", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "普通本科批", enrollment: 1, highest: 520, lowest: 520, lowestRank: 46591 },
  { province: "河南", major: "健康服务与管理", category: "文史/历史类", batch: "普通本科批", enrollment: 1, highest: 518, lowest: 518, lowestRank: 48095 },

  { province: "湖北", major: "临床医学", category: "理工/物理类", batch: "本科普通批", enrollment: 2, highest: 504, lowest: 489, lowestRank: 96218 },
  { province: "湖北", major: "预防医学", category: "理工/物理类", batch: "本科普通批", enrollment: 3, highest: 477, lowest: 473, lowestRank: 110381 },

  { province: "江西", major: "临床医学", category: "理工/物理类", batch: "本科", enrollment: 3, highest: 507, lowest: 494, lowestRank: 92002 },
  { province: "江西", major: "预防医学", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 472, lowest: 469, lowestRank: 124774 },
  { province: "江西", major: "康复治疗学", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 476, lowest: 469, lowestRank: 124774 },
  { province: "江西", major: "药学", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 479, lowest: 472, lowestRank: 120774 },
  { province: "江西", major: "医学信息工程", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 469, lowest: 466, lowestRank: 128651 },
  { province: "江西", major: "护理学", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 472, lowest: 466, lowestRank: 128651 },
  { province: "江西", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 467, lowest: 467, lowestRank: 127347 },
  { province: "江西", major: "医疗保险", category: "理工/物理类", batch: "本科", enrollment: 2, highest: 462, lowest: 460, lowestRank: 136502 },
  { province: "江西", major: "护理学", category: "文史/历史类", batch: "本科", enrollment: 1, highest: 511, lowest: 511, lowestRank: 31293 },
  { province: "江西", major: "健康服务与管理", category: "文史/历史类", batch: "本科", enrollment: 1, highest: 513, lowest: 513, lowestRank: 30102 },
  { province: "江西", major: "英语", category: "文史/历史类", batch: "本科", enrollment: 1, highest: 516, lowest: 516, lowestRank: 28374 },

  { province: "辽宁", major: "临床医学", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 521, lowest: 514, lowestRank: 49664 },
  { province: "辽宁", major: "预防医学", category: "理工/物理类", batch: "本科批", enrollment: 3, highest: 467, lowest: 460, lowestRank: 76739 },

  { province: "山东", major: "临床医学", category: "综合改革", batch: "常规批", enrollment: 4, highest: 534, lowest: 519, lowestRank: 143184 },
  { province: "山东", major: "预防医学", category: "综合改革", batch: "常规批", enrollment: 3, highest: 460, lowest: 455, lowestRank: 299775 },
  { province: "山东", major: "康复治疗学", category: "综合改革", batch: "常规批", enrollment: 3, highest: 481, lowest: 474, lowestRank: 251794 },
  { province: "山东", major: "药学", category: "综合改革", batch: "常规批", enrollment: 3, highest: 466, lowest: 462, lowestRank: 282367 },
  { province: "山东", major: "医学信息工程", category: "综合改革", batch: "常规批", enrollment: 1, highest: 452, lowest: 452, lowestRank: 307161 },
  { province: "山东", major: "护理学", category: "综合改革", batch: "常规批", enrollment: 3, highest: 521, lowest: 513, lowestRank: 156817 },
  { province: "山东", major: "公共事业管理（卫生事业管理）", category: "综合改革", batch: "常规批", enrollment: 1, highest: 503, lowest: 503, lowestRank: 180146 },
  { province: "山东", major: "医疗保险", category: "综合改革", batch: "常规批", enrollment: 1, highest: 500, lowest: 500, lowestRank: 187310 },
  { province: "山东", major: "健康服务与管理", category: "综合改革", batch: "常规批", enrollment: 1, highest: 499, lowest: 499, lowestRank: 189757 },

  { province: "山西", major: "临床医学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 501, lowest: 495, lowestRank: 64106 },
  { province: "山西", major: "预防医学", category: "理工/物理类", batch: "普通本科批", enrollment: 2, highest: 467, lowest: 466, lowestRank: 86533 },
  { province: "山西", major: "医学检验技术", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 459, lowest: 459, lowestRank: 92077 },
  { province: "山西", major: "康复治疗学", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 471, lowest: 471, lowestRank: 82616 },
  { province: "山西", major: "药学", category: "理工/物理类", batch: "普通本科批", enrollment: 5, highest: 492, lowest: 457, lowestRank: 93626 },
  { province: "山西", major: "制药工程", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 450, lowest: 450, lowestRank: 98899 },
  { province: "山西", major: "医学信息工程", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 491, lowest: 491, lowestRank: 67158 },
  { province: "山西", major: "护理学", category: "理工/物理类", batch: "普通本科批", enrollment: 1, highest: 462, lowest: 462, lowestRank: 89712 },
  { province: "山西", major: "医疗保险", category: "文史/历史类", batch: "普通本科批", enrollment: 2, highest: 470, lowest: 469, lowestRank: 29009 },
  { province: "山西", major: "健康服务与管理", category: "文史/历史类", batch: "普通本科批", enrollment: 2, highest: 476, lowest: 474, lowestRank: 27610 },
  { province: "山西", major: "英语", category: "文史/历史类", batch: "普通本科批", enrollment: 2, highest: 474, lowest: 473, lowestRank: 27891 },

  { province: "上海", major: "临床医学", category: "综合改革", batch: "本科普通批", enrollment: 2, highest: 450, lowest: 440, lowestRank: 40711 },
  { province: "上海", major: "预防医学", category: "综合改革", batch: "本科普通批", enrollment: 2, highest: 439, lowest: 437, lowestRank: 41436 },
  { province: "上海", major: "卫生检验与检疫", category: "综合改革", batch: "本科普通批", enrollment: 2, highest: 432, lowest: 430, lowestRank: 43131 },
  { province: "上海", major: "康复治疗学", category: "综合改革", batch: "本科普通批", enrollment: 6, highest: 430, lowest: 422, lowestRank: 45012 },
  { province: "上海", major: "药学", category: "综合改革", batch: "本科普通批", enrollment: 4, highest: 427, lowest: 422, lowestRank: 45012 },
  { province: "上海", major: "医学信息工程", category: "综合改革", batch: "本科普通批", enrollment: 2, highest: 424, lowest: 421, lowestRank: 45226 },
  { province: "上海", major: "护理学", category: "综合改革", batch: "本科普通批", enrollment: 2, highest: 452, lowest: 445, lowestRank: 39429 },

  { province: "四川", major: "临床医学", category: "理工/物理类", batch: "本科批", enrollment: 8, highest: 523, lowest: 506, lowestRank: 119161 },
  { province: "四川", major: "预防医学", category: "理工/物理类", batch: "本科批", enrollment: 4, highest: 506, lowest: 494, lowestRank: 135473 },
  { province: "四川", major: "医学影像技术", category: "理工/物理类", batch: "本科批", enrollment: 1, highest: 501, lowest: 501, lowestRank: 125937 },
  { province: "四川", major: "医学检验技术", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 503, lowest: 502, lowestRank: 124544 },
  { province: "四川", major: "康复治疗学", category: "理工/物理类", batch: "本科批", enrollment: 5, highest: 503, lowest: 496, lowestRank: 132669 },
  { province: "四川", major: "药学", category: "理工/物理类", batch: "本科批", enrollment: 6, highest: 499, lowest: 494, lowestRank: 135473 },
  { province: "四川", major: "制药工程", category: "理工/物理类", batch: "本科批", enrollment: 4, highest: 504, lowest: 493, lowestRank: 136811 },
  { province: "四川", major: "医学信息工程", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 488, lowest: 484, lowestRank: 149186 },
  { province: "四川", major: "护理学", category: "理工/物理类", batch: "本科批", enrollment: 3, highest: 492, lowest: 490, lowestRank: 140851 },
  { province: "四川", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 483, lowest: 479, lowestRank: 156077 },
  { province: "四川", major: "医疗保险", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 486, lowest: 467, lowestRank: 172209 },
  { province: "四川", major: "健康服务与管理", category: "理工/物理类", batch: "本科批", enrollment: 2, highest: 480, lowest: 469, lowestRank: 169623 },
  { province: "四川", major: "医疗产品管理", category: "理工/物理类", batch: "本科批", enrollment: 1, highest: 482, lowest: 482, lowestRank: 151883 },
  { province: "四川", major: "护理学", category: "文史/历史类", batch: "本科批", enrollment: 3, highest: 526, lowest: 517, lowestRank: 37405 },
  { province: "四川", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "本科批", enrollment: 8, highest: 510, lowest: 489, lowestRank: 55309 },
  { province: "四川", major: "医疗保险", category: "文史/历史类", batch: "本科批", enrollment: 8, highest: 496, lowest: 487, lowestRank: 56697 },
  { province: "四川", major: "健康服务与管理", category: "文史/历史类", batch: "本科批", enrollment: 8, highest: 511, lowest: 490, lowestRank: 54633 },
  { province: "四川", major: "医疗产品管理", category: "文史/历史类", batch: "本科批", enrollment: 8, highest: 514, lowest: 487, lowestRank: 56697 },
  { province: "四川", major: "英语", category: "文史/历史类", batch: "本科批", enrollment: 8, highest: 519, lowest: 482, lowestRank: 60241 },

  { province: "西藏", major: "医学影像技术", category: "理工/物理类", batch: "本科二批", enrollment: 3, highest: 298, lowest: 268 },
  { province: "西藏", major: "医学检验技术", category: "理工/物理类", batch: "本科二批", enrollment: 3, highest: 288, lowest: 266 },
  { province: "西藏", major: "护理学", category: "理工/物理类", batch: "本科二批", enrollment: 8, highest: 285, lowest: 256 },
  { province: "西藏", major: "公共事业管理（卫生事业管理）", category: "理工/物理类", batch: "本科二批", enrollment: 2, highest: 260, lowest: 256 },
  { province: "西藏", major: "医疗保险", category: "理工/物理类", batch: "本科二批", enrollment: 2, highest: 259, lowest: 256 },
  { province: "西藏", major: "护理学", category: "文史/历史类", batch: "本科二批", enrollment: 8, highest: 318, lowest: 294 },
  { province: "西藏", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "本科二批", enrollment: 2, highest: 309, lowest: 297 },
  { province: "西藏", major: "医疗保险", category: "文史/历史类", batch: "本科二批", enrollment: 2, highest: 293, lowest: 293 },

  { province: "新疆", major: "临床医学", category: "理工/物理类", batch: "本科第二批", enrollment: 2, highest: 408, lowest: 405 },
  { province: "新疆", major: "医学影像技术", category: "理工/物理类", batch: "本科第二批", enrollment: 1, highest: 362, lowest: 362 },
  { province: "新疆", major: "制药工程", category: "理工/物理类", batch: "本科第二批", enrollment: 1, highest: 327, lowest: 327 },
  { province: "新疆", major: "护理学", category: "理工/物理类", batch: "本科第二批", enrollment: 2, highest: 319, lowest: 307 },

  { province: "云南", major: "临床医学", category: "理工/物理类", batch: "本科批B段", enrollment: 4, highest: 474, lowest: 464, lowestRank: 89904 },
  { province: "云南", major: "制药工程", category: "理工/物理类", batch: "本科批B段", enrollment: 2, highest: 455, lowest: 454, lowestRank: 97446 },
  { province: "云南", major: "药学", category: "理工/物理类", batch: "本科批B段", enrollment: 3, highest: 469, lowest: 459, lowestRank: 93709 },
  { province: "云南", major: "医学信息工程", category: "理工/物理类", batch: "本科批B段", enrollment: 2, highest: 476, lowest: 453, lowestRank: 98245 },
  { province: "云南", major: "预防医学", category: "理工/物理类", batch: "本科批B段", enrollment: 2, highest: 473, lowest: 463, lowestRank: 90658 },
  { province: "云南", major: "公共事业管理（卫生事业管理）", category: "文史/历史类", batch: "本科批B段", enrollment: 2, highest: 494, lowest: 493, lowestRank: 30285 },
  { province: "云南", major: "医疗保险", category: "文史/历史类", batch: "本科批B段", enrollment: 2, highest: 544, lowest: 502, lowestRank: 26699 },
  { province: "云南", major: "护理学", category: "文史/历史类", batch: "本科批B段", enrollment: 2, highest: 510, lowest: 498, lowestRank: 28212 },

  { province: "浙江", major: "临床医学", category: "综合改革", batch: "普通类平行", enrollment: 2, highest: 560, lowest: 549, lowestRank: 113980 },
  { province: "浙江", major: "预防医学", category: "综合改革", batch: "普通类平行", enrollment: 2, highest: 531, lowest: 507, lowestRank: 165101 },
  { province: "浙江", major: "康复治疗学", category: "综合改革", batch: "普通类平行", enrollment: 3, highest: 530, lowest: 507, lowestRank: 165101 },
  { province: "浙江", major: "药学", category: "综合改革", batch: "普通类平行", enrollment: 2, highest: 506, lowest: 506, lowestRank: 166262 },
  { province: "浙江", major: "医学信息工程", category: "综合改革", batch: "普通类平行", enrollment: 2, highest: 511, lowest: 503, lowestRank: 169717 },
  { province: "浙江", major: "公共事业管理（卫生事业管理）", category: "综合改革", batch: "普通类平行", enrollment: 3, highest: 561, lowest: 554, lowestRank: 107736 },
  { province: "浙江", major: "医疗保险", category: "综合改革", batch: "普通类平行", enrollment: 2, highest: 554, lowest: 552, lowestRank: 110269 },
];

function trackFields(category: OfficialCategory): { track: AdmissionTrack; firstSubject: AdmissionFirstSubject } {
  if (category === "综合改革") return { track: "综合改革", firstSubject: null };
  if (category === "文史/历史类") return { track: "历史等科目类", firstSubject: "历史" };
  return { track: "物理等科目类", firstSubject: "物理" };
}

function durationForMajor(major: string) {
  return major === "临床医学" || major === "预防医学" ? "五年" : "四年";
}

export const official2025MajorRecords: AdmissionRecord[] = official2025Rows.map((row, index) => {
  const { track, firstSubject } = trackFields(row.category);
  return {
    id: `official-2025-${String(index + 1).padStart(3, "0")}`,
    collegeName,
    year: 2026,
    province: row.province,
    programGroup: row.batch,
    track,
    firstSubject,
    requiredSubjects: [],
    major: row.major,
    duration: durationForMajor(row.major),
    plan2025: row.enrollment,
    plan2026: row.enrollment,
    score2022: null,
    score2023: null,
    score2024: null,
    score2025: {
      highest: row.highest,
      lowest: row.lowest,
      ...(typeof row.lowestRank === "number" ? { lowestRank: row.lowestRank } : {}),
    },
    batch: row.batch,
    dataLevel: "major",
    sourceTitle,
    sourceUrl,
  };
});

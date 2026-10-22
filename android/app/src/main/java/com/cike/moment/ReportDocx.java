package com.cike.moment;

import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.*;

/** Generates editable, monochrome OOXML without external services. */
public final class ReportDocx {
    private static String x(String s) {
        StringBuilder b=new StringBuilder();
        s.codePoints().filter(c -> c==9 || c==10 || c==13 || c>=32 && c<=0xD7FF || c>=0xE000 && c<=0xFFFD || c>=0x10000 && c<=0x10FFFF).forEach(b::appendCodePoint);
        return b.toString().replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;");
    }
    private static String run(String text, boolean bold, int size) {
        return "<w:r><w:rPr><w:rFonts w:ascii=\"Microsoft YaHei\" w:hAnsi=\"Microsoft YaHei\" w:eastAsia=\"Microsoft YaHei\"/><w:color w:val=\"000000\"/><w:sz w:val=\""+size+"\"/>"+(bold?"<w:b/>":"")+"</w:rPr><w:t xml:space=\"preserve\">"+x(text)+"</w:t></w:r>";
    }
    private static String p(String text, boolean bold, int size, boolean keep) {
        StringBuilder content=new StringBuilder();
        for(String line:text.split("\\n",-1)) { if(content.length()>0) content.append("<w:r><w:br/></w:r>"); content.append(run(line,bold,size)); }
        return "<w:p><w:pPr><w:spacing w:after=\"120\" w:line=\"300\" w:lineRule=\"auto\"/>"+(keep?"<w:keepNext/>":"")+"</w:pPr>"+content+"</w:p>";
    }
    private static String cell(String text, boolean bold, int width, boolean center) {
        return "<w:tc><w:tcPr><w:tcW w:w=\""+width+"\" w:type=\"dxa\"/><w:tcMar><w:top w:w=\"90\" w:type=\"dxa\"/><w:bottom w:w=\"90\" w:type=\"dxa\"/><w:left w:w=\"120\" w:type=\"dxa\"/><w:right w:w=\"120\" w:type=\"dxa\"/></w:tcMar></w:tcPr><w:p><w:pPr>"+(center?"<w:jc w:val=\"center\"/>":"")+"</w:pPr>"+run(text,bold,22)+"</w:p></w:tc>";
    }
    static class Stat {String name;Set<String> days=new HashSet<>();double total;int rated; Stat(String n){name=n;}}
    public static byte[] create(JSONObject report) throws Exception {
        JSONArray records=report.getJSONArray("records");
        Map<String,Stat> stats=new LinkedHashMap<>();Set<String> days=new HashSet<>();
        for(int i=0;i<records.length();i++) {
            JSONObject r=records.getJSONObject(i);String day=r.getString("day");days.add(day);JSONArray tags=r.getJSONArray("tags");
            for(int j=0;j<tags.length();j++) {
                JSONObject tag=tags.getJSONObject(j);
                if(!tag.optBoolean("symptom",true))continue;
                String name=tag.getString("name");Stat stat=stats.computeIfAbsent(name,Stat::new);stat.days.add(day);
                double score=tag.optDouble("rating",Double.NaN);
                if(Double.isFinite(score)&&score>=1&&score<=5){stat.total+=score;stat.rated++;}
            }
        }
        StringBuilder body=new StringBuilder();
        body.append(p("此刻个人记录",true,40,true));
        body.append(p(report.getString("start")+" 至 "+report.getString("end"),false,24,true));
        body.append(p("共 "+records.length()+" 条记录，记录覆盖 "+days.size()+" 天。",false,22,false));
        body.append(p("症状统计",true,28,true));
        List<Stat> sorted=new ArrayList<>(stats.values());sorted.sort((a,b)->Integer.compare(b.days.size(),a.days.size()));
        if(!sorted.isEmpty()) {
            body.append("<w:tbl><w:tblPr><w:tblW w:w=\"9700\" w:type=\"dxa\"/><w:tblBorders><w:top w:val=\"single\" w:sz=\"8\"/><w:bottom w:val=\"single\" w:sz=\"8\"/><w:insideH w:val=\"single\" w:sz=\"4\"/><w:left w:val=\"nil\"/><w:right w:val=\"nil\"/><w:insideV w:val=\"nil\"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w=\"4000\"/><w:gridCol w:w=\"2000\"/><w:gridCol w:w=\"3700\"/></w:tblGrid>");
            body.append("<w:tr><w:trPr><w:tblHeader/></w:trPr>").append(cell("症状或不适",true,4000,false)).append(cell("出现天数",true,2000,true)).append(cell("程度均分",true,3700,true)).append("</w:tr>");
            for(Stat stat:sorted) {
                String degree="未评分";
                if(stat.rated>0){double mean=stat.total/stat.rated;int halves=(int)Math.round(mean*2);degree=repeat("■",halves/2)+(halves%2==1?"◧":"")+repeat("□",5-(halves+1)/2)+String.format(Locale.ROOT,"  %.1f",mean);}
                body.append("<w:tr><w:trPr><w:cantSplit/></w:trPr>").append(cell(stat.name,false,4000,false)).append(cell(stat.days.size()+" 天",false,2000,true)).append(cell(degree,true,3700,true)).append("</w:tr>");
            }
            body.append("</w:tbl>");
        } else body.append(p("所选记录没有症状标签，活动与其他记录见下文。",false,22,false));
        body.append(p("当天记录过即计1天。均分仅计算同一标签的已评分记录，未评分不计为0。■为整格，◧为半格，□为空格；方块按最近半级示意，数字为实际均分。未记录不代表未发生；程度为个人对照，不作为临床量表或诊断结论。",false,18,false));
        body.append(p("想在就诊时补充的内容",true,26,true));body.append(p("可在这里补写想问的问题、近期变化或其他背景。",false,22,false));
        body.append("<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>");
        String last="";
        for(int i=0;i<records.length();i++) {
            JSONObject r=records.getJSONObject(i);String day=r.getString("day");
            if(!day.equals(last)){body.append(p(day,true,28,true));last=day;}
            body.append(p(r.getString("time"),true,24,true));
            JSONArray tags=r.getJSONArray("tags");
            for(int j=0;j<tags.length();j++) {
                JSONObject t=tags.getJSONObject(j);String text=t.getString("name");JSONArray parts=t.optJSONArray("parts");
                if(parts!=null&&parts.length()>0){List<String> names=new ArrayList<>();for(int k=0;k<parts.length();k++)names.add(parts.getString(k));text+="  |  "+String.join("、",names);}
                int score=t.optInt("rating",0);text+="  |  "+(score>=1&&score<=5?"程度 "+score+"/5":t.optBoolean("symptom",true)?"未评分":"仅记录");
                body.append(p(text,false,22,true));
                if(!t.optString("note").isEmpty())body.append(p("补充："+t.optString("note"),false,22,true));
            }
            JSONArray thoughts=r.optJSONArray("thoughts");if(thoughts!=null)for(int j=0;j<thoughts.length();j++)body.append(p(thoughts.getString(j),false,22,true));
            body.append(p(r.optString("note").isEmpty()?"":"自由描述："+r.optString("note"),false,22,false));
        }
        String document="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>"+body+"<w:sectPr><w:pgSz w:w=\"11906\" w:h=\"16838\"/><w:pgMar w:top=\"1000\" w:right=\"1100\" w:bottom=\"1000\" w:left=\"1100\"/></w:sectPr></w:body></w:document>";
        ByteArrayOutputStream bytes=new ByteArrayOutputStream();
        try(ZipOutputStream zip=new ZipOutputStream(bytes)) {
            entry(zip,"[Content_Types].xml","<?xml version=\"1.0\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>");
            entry(zip,"_rels/.rels","<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>");
            entry(zip,"word/document.xml",document);
        }
        return bytes.toByteArray();
    }
    private static String repeat(String text,int count){StringBuilder out=new StringBuilder();for(int i=0;i<count;i++)out.append(text);return out.toString();}
    private static void entry(ZipOutputStream zip,String name,String text)throws IOException{zip.putNextEntry(new ZipEntry(name));zip.write(text.getBytes(StandardCharsets.UTF_8));zip.closeEntry();}
}

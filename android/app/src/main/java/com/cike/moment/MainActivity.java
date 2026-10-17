package com.cike.moment;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.Toast;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private WebView web;
    private byte[] pendingDocument;
    private static final int SAVE_WORD = 41;
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(0xfffffdf7);
        setContentView(web);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setTextZoom(100);
        web.addJavascriptInterface(new ExportBridge(), "CikeAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri url = req.getUrl();
                if ("https".equals(url.getScheme()) && "appassets.androidplatform.net".equals(url.getHost())) {
                    String path = url.getPath();
                    String file = "/".equals(path) ? "index.html" : path.substring(1);
                    if (file.equals("index.html") || file.equals("style.css") || file.equals("app.js")) {
                        try {
                            String mime = file.endsWith(".js") ? "application/javascript" : file.endsWith(".css") ? "text/css" : "text/html";
                            return new WebResourceResponse(mime, "UTF-8", getAssets().open(file));
                        } catch (IOException ignored) { }
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return true; }
        });
        web.loadUrl(ORIGIN + "/index.html");
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
    }
    private void handleBack() {
        web.evaluateJavascript("window.cikeBack ? window.cikeBack() : false", result -> { if (!"true".equals(result)) moveTaskToBack(true); });
    }
    @Override public void onBackPressed() { handleBack(); }
    @Override protected void onPause() { web.evaluateJavascript("localStorage.getItem('cike-v1')", null); super.onPause(); }
    private void message(String text) { runOnUiThread(() -> Toast.makeText(this, text, Toast.LENGTH_LONG).show()); }
    private class ExportBridge {
        @JavascriptInterface public void saveWord(String payload) {
            new Thread(() -> {
                try {
                    JSONObject report = new JSONObject(payload);
                    byte[] bytes = ReportDocx.create(report);
                    runOnUiThread(() -> {
                        if (pendingDocument != null) { message("请先完成上一次文件保存"); return; }
                        pendingDocument = bytes;
                        Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                        save.addCategory(Intent.CATEGORY_OPENABLE);
                        save.setType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                        save.putExtra(Intent.EXTRA_TITLE, "此刻记录_" + report.optString("start") + "_" + report.optString("end") + ".docx");
                        try { startActivityForResult(save, SAVE_WORD); }
                        catch (Exception e) { pendingDocument = null; message("无法打开文件保存器，请检查系统文件管理应用"); }
                    });
                } catch (Exception e) { message("文档生成失败，请重试"); }
            }, "cike-export").start();
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != SAVE_WORD) return;
        byte[] bytes = pendingDocument; pendingDocument = null;
        if (result != RESULT_OK || data == null || bytes == null) return;
        Uri uri = data.getData();
        new Thread(() -> {
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new IOException("No output");
                out.write(bytes); message("Word 记录已保存，可用 WPS 或 Word 打开");
            } catch (Exception e) { message("保存失败，请重新导出并选择其他位置"); }
        }, "cike-save").start();
    }
}

/**
 * 네이버 블로그 스마트에디터 ONE 서식 완벽 복사 유틸리티
 * 텍스트와 서식(HTML)을 클립보드에 동시에 주입하여 붙여넣었을 때
 * 네이버 에디터 고유의 인라인 스타일과 인용구 박스가 온전히 살아나도록 합니다.
 */

export async function copySmartEditorContent(htmlContent, plainTextContent) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const typeHtml = 'text/html';
      const typeText = 'text/plain';

      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([plainTextContent || htmlContent.replace(/<[^>]+>/g, '')], { type: typeText });

      const data = [
        new ClipboardItem({
          [typeHtml]: blobHtml,
          [typeText]: blobText,
        })
      ];

      await navigator.clipboard.write(data);
      return { success: true };
    } else {
      // 레거시 폴백: 임시 contentEditable 요소 생성 후 copy 명령
      const tempEl = document.createElement('div');
      tempEl.contentEditable = 'true';
      tempEl.innerHTML = htmlContent;
      tempEl.style.position = 'fixed';
      tempEl.style.left = '-9999px';
      document.body.appendChild(tempEl);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(tempEl);
      selection.removeAllRanges();
      selection.addRange(range);

      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(tempEl);

      if (successful) {
        return { success: true };
      }
      throw new Error('클립보드 복사에 실패했습니다.');
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
    // 텍스트 전용 복사 2차 시도
    try {
      await navigator.clipboard.writeText(plainTextContent || htmlContent.replace(/<[^>]+>/g, ''));
      return { success: true, textOnly: true };
    } catch (fallbackErr) {
      return { success: false, error: err.message };
    }
  }
}

export async function copyPlainText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

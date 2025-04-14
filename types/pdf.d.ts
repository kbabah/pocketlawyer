declare module 'pdfjs-dist' {
  interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  interface TextContent {
    items: Array<TextItem | TextMarkedContent>;
  }

  interface TextItem {
    str: string;
  }

  interface TextMarkedContent {
    type: string;
  }

  interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(data: { data: Uint8Array }): PDFDocumentLoadingTask;
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}
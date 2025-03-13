import natural from 'natural';





export function clean_text(text) {
  
    text = text.replace(/[^a-zA-Z0-9\s]/g, '');

    text = text.toLowerCase();

    text = text.replace(/\s+/g, ' ').trim();
    return text;
}


export function tokenize_text(text) {

    const tokenizer = new natural.WordTokenizer();
    return tokenizer.tokenize(text);
}


export function vectorize_text(corpus) {

    const tfidf = new natural.TfIdf();

    corpus.forEach((doc) => tfidf.addDocument(doc));

    const vectors = corpus.map((doc) => {
        const vector = [];
        tfidf.tfidfs(doc, (i, measure) => {
            vector[i] = measure;
        });
        return vector;
    });

    return vectors;
}
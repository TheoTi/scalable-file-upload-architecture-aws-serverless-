export type ChunkParsed = {
	nrInst: string;
	nrAgencia: string;
	cdClient: string;
	nmClient: string;
	nrCpfCnpj: string;
	nrContrato: string;
	dtContrato: string;
	qtPrestacoes: string;
	vlTotal: string;
	cdProduto: string;
	dsProduto: string;
	cdCarteira: string;
	dsCarteira: string;
	nrProposta: string;
	nrPresta: string;
	tpPresta: string;
	nrSeqPre: string;
	dtVctPre: string;
	vlPresta: string;
	vlMora: string;
	vlMulta: string;
	vlOutAcr: string;
	vlIof: string;
	vlDescon: string;
	vlAtual: string;
	idSituac: string;
	idSitVen: string;
};

const header = [
	'nrInst',
	'nrAgencia',
	'cdClient',
	'nmClient',
	'nrCpfCnpj',
	'nrContrato',
	'dtContrato',
	'qtPrestacoes',
	'vlTotal',
	'cdProduto',
	'dsProduto',
	'cdCarteira',
	'dsCarteira',
	'nrProposta',
	'nrPresta',
	'tpPresta',
	'nrSeqPre',
	'dtVctPre',
	'vlPresta',
	'vlMora',
	'vlMulta',
	'vlOutAcr',
	'vlIof',
	'vlDescon',
	'vlAtual',
	'idSituac',
	'idSitVen',
];

export function parseChunk(chunk: string): ChunkParsed[] {
	const lines = chunk.split('\n').filter((line) => line.trim());

	return lines.map((line) => {
		const values = line.split(',');

		const record: Partial<ChunkParsed> = {};
		header.forEach((key, index) => {
			record[key as keyof ChunkParsed] = values[index] || '';
		});

		return record as ChunkParsed;
	});
}

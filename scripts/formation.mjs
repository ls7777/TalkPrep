// Deterministic localization of the source's finite grammar notation vocabulary.
// Original notation remains in the pinned upstream files.
export function chineseFormation(value){
 const pairs=[['Question word','疑问词'],['Verb-volitional','动词意向形'],['Verb-dict','动词辞书形'],['Verb-plain','动词普通形'],['Verb-stem','动词ます形词干'],['Verb-nai','动词ない形'],['Verb-ta','动词た形'],['Verb-te','动词て形'],['Verb-ba','动词ば形'],['i-Adj-ku','い形容词く形'],['i-Adj','い形容词'],['na-Adj','な形容词'],['Noun','名词'],['Sentence','句子'],['potential form','可能形'],['ichidan verbs','一段动词'],['the same verb','同一动词'],['same verb','同一动词'],['counter','量词'],['particle','助词'],['stem of','词干：'],['stem','词干'],['same','相同的'],['verb','动词'],['word','词'],['form','形式'],[' of ','的']]
 for(const [en,zh] of pairs)value=value.replaceAll(en,zh)
 value=value.replaceAll('potential','可能形')
 return value
}

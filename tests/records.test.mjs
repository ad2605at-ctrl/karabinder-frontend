import assert from 'node:assert/strict';
import test from 'node:test';
import { examples, historyFor, search, putContact, putConversation, localDate } from '../src/data/model.ts';

test('会社・氏名・本文・日付で名刺を検索できる', () => {
  assert.equal(search(examples, '青井')[0].id, 'aoi');
  assert.equal(search(examples, '灯台デザイン').length, 1);
  assert.equal(search(examples, '  試作品　撮影  ').length, 2);
  assert.equal(search(examples, localDate(examples.conversations[0].date)).length, 2);
  assert.equal(search(examples, '存在しない会社').length, 0);
  assert.equal(search(examples, '').length, 3);
});

test('名刺の編集で二重登録や履歴の消失が起きない', () => {
  const newer = putContact(examples, { id: 'aoi', name: ' 青井 葵 ', company: '架空商事' });
  assert.equal(newer.contacts.length, 3);
  assert.equal(search(newer, '架空商事')[0].name, '青井 葵');
  assert.deepEqual(historyFor(newer, 'aoi'), historyFor(examples, 'aoi'));
  assert.throws(() => putContact(examples, { id: 'b', name: ' ', company: '' }));
});

test('再会は別の会話、複数人の会話は共通のメモとして保存する', () => {
  const meeting = { id: 'new', date: '2026-10-25T03:00:00Z', contactIds: ['mori','aoi'], text: '次回の相談' };
  const saved = putConversation(examples, meeting);
  assert.deepEqual(historyFor(saved, 'aoi').map(m => m.id), ['new','meeting-1']);
  const edited = putConversation(saved, { ...meeting, text: '内容を更新' });
  assert.equal(historyFor(edited, 'mori')[0].text, '内容を更新');
  assert.equal(search(edited, '内容を更新').length, 2);
  assert.equal(edited.conversations.length, saved.conversations.length);
});

test('空のメモ・不明な参加者を拒否し、音声のみのメモを受け付ける', () => {
  const blank = { ...examples.conversations[0], text: ' ' };
  assert.throws(() => putConversation(examples, blank));
  assert.throws(() => putConversation(examples, { ...blank, text: '記録', contactIds: [] }));
  assert.throws(() => putConversation(examples, { ...blank, text: '記録', contactIds: ['missing'] }));
  assert.equal(putConversation(examples, { ...blank, audio: 'sample.m4a' }).conversations[0].audio, 'sample.m4a');
});

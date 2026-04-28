-- By Lot. — seed entries for the wall.
-- Run this once in Supabase → SQL Editor (it uses the service-role context,
-- which bypasses RLS so is_seed=true rows can be inserted).
--
-- These rows are written for prototype atmosphere only. Edit, replace, or remove
-- before any public launch. They are flagged is_seed=true so they are easy to
-- distinguish from real submissions in the table editor.

-- Optional: clear previous seeds first (does NOT touch real submissions).
-- delete from public.submissions where is_seed = true;

insert into public.submissions (chapter, content, is_seed, created_at) values
('believe', 'A way of arguing that doesn''t end in someone being shot. That''s it. The rest I''ll figure out.', true, now() - interval '7 days'),
('believe', 'The agreement that I and the person who hates me have to keep talking. That''s the whole thing.', true, now() - interval '7 days' - interval '1 hour'),
('believe', 'I think I mean the freedom to be wrong out loud and not lose my job. I am not sure that exists.', true, now() - interval '7 days' - interval '2 hours'),
('believe', 'Procedure. I''m sorry. I know that''s bloodless. But what I actually trust is procedure.', true, now() - interval '7 days' - interval '3 hours'),
('believe', 'I notice that when I try to write this I write what I am supposed to write. So perhaps democracy, for me, is the constant suspicion of that.', true, now() - interval '7 days' - interval '4 hours'),
('believe', 'Being able to lose without losing everything.', true, now() - interval '7 days' - interval '5 hours'),

('govern', 'Tenants'' meeting. The lift. Six of us. The 86-year-old couldn''t make the stairs anymore and we voted to cover the assessment ourselves rather than send it to her. I was afraid the young couple on the second floor would feel cheated. They were the first to say yes.', true, now() - interval '7 days'),
('govern', 'Whether to let my mother keep driving. There were four of us in the kitchen. She wasn''t there. I cried in the car afterwards because I had been right and that didn''t help.', true, now() - interval '7 days' - interval '1 hour'),
('govern', 'I''m a teacher. I had to decide whether to fail a student whose father had just died. I failed him. He needed it to mean something. I think I was right. I am not sure.', true, now() - interval '7 days' - interval '2 hours'),
('govern', 'Standup at work. We voted to ship the feature without the accessibility audit. I voted yes. I think about it most weeks.', true, now() - interval '7 days' - interval '3 hours'),
('govern', 'The will. My father''s. My brother and I, in the lawyer''s office, deciding what to do about the cousin who''d been quietly written out. We put her back in. He never knew.', true, now() - interval '7 days' - interval '4 hours'),

('silence', 'I don''t think most of the people I know who say they care about climate actually do. I include myself.', true, now() - interval '7 days'),
('silence', 'I voted for the party my parents would have hated and I have not told them and they are still alive.', true, now() - interval '7 days' - interval '1 hour'),
('silence', 'I think the housing crisis is, in part, my fault, and the fault of people exactly like me, and I don''t know what to do with that so I don''t say it.', true, now() - interval '7 days' - interval '2 hours'),
('silence', 'I am tired of being asked to feel a particular way about a particular war and I do not know how to say this without sounding like I do not care, which is also not true.', true, now() - interval '7 days' - interval '3 hours'),
('silence', 'The thought I have not said: that I am not sure my country deserves to continue in its current shape. I have lived here all my life. I love it. I think this anyway.', true, now() - interval '7 days' - interval '4 hours'),

('lesser', 'March 2024. I sat in the car for eleven minutes before I went in. I voted for the one I disliked less. I felt like I had agreed to something I had not agreed to.', true, now() - interval '7 days'),
('lesser', 'I did not vote. I told myself it was a protest. It was not. It was tiredness.', true, now() - interval '7 days' - interval '1 hour'),
('lesser', 'I voted for someone I knew would lose, because I wanted, on paper, somewhere, a record that I had not consented to either of the others.', true, now() - interval '7 days' - interval '2 hours'),
('lesser', 'My mother called me on the morning of, the way she always does. We did not agree. We hung up gently. I voted the way I had told her I would. I am not sure I would do it again.', true, now() - interval '7 days' - interval '3 hours'),
('lesser', 'I cried in the booth. I am 34. I have never cried in a booth before.', true, now() - interval '7 days' - interval '4 hours'),

('drawn', 'I would wear what I wear to my sister''s wedding. I would call my partner. I would walk into the chamber and say: I do not know what I am doing here, and that, I think, is the point.', true, now() - interval '7 days'),
('drawn', 'I would call my mother. She would cry. I would say: please do not tell anyone yet. I would walk in in the suit my father was buried in. I would not speak on the first day.', true, now() - interval '7 days' - interval '1 hour'),
('drawn', 'I would wear the navy dress. I would call no one. I would walk in and I would listen, for the entire first day, and not say a word. I would write down every name.', true, now() - interval '7 days' - interval '2 hours'),
('drawn', 'I''d call my old union rep. I''d wear what I wore to the picket line. I''d say: I am here because no one chose me. Treat me accordingly.', true, now() - interval '7 days' - interval '3 hours'),
('drawn', 'Honestly? I would be terrified. I would call my therapist. I would wear black. I would say nothing on the first day. I would say nothing on the second day. On the third I would ask one question.', true, now() - interval '7 days' - interval '4 hours'),

('imagine', 'Tuesday morning, the headline is about a new train line in a place no one in Berlin has ever cared about, because three of the drawn are from there and they will not stop talking about it. People at the bus stop complain about the train. This is a victory.', true, now() - interval '7 days'),
('imagine', 'The phrase I overhear: "my cousin''s on it this term." Said with neither pride nor embarrassment. The way you''d say someone was on jury duty.', true, now() - interval '7 days' - interval '1 hour'),
('imagine', 'What is no longer argued about: whether the politicians are corrupt. They aren''t politicians. They''re Frau Müller from the post office and she is going home for Easter.', true, now() - interval '7 days' - interval '2 hours'),
('imagine', 'Headlines smaller. Faces less polished. The morning show stops booking the same eleven people. A woman who runs a kindergarten in Halle explains a bill about water rights and she is not embarrassed and she is not condescended to.', true, now() - interval '7 days' - interval '3 hours'),
('imagine', 'At the bus stop, a man says: "I was drawn last year. I would not do it again. But I am glad I did it." His friend says: "my daughter was drawn the year before. Same." They get on the bus.', true, now() - interval '7 days' - interval '4 hours'),

('objection', 'Most people, including me, are not equipped to legislate. Briefings will not fix this in four years.', true, now() - interval '7 days'),
('objection', 'It will be captured by whoever runs the staff. The drawn will be ornamental.', true, now() - interval '7 days' - interval '1 hour'),
('objection', 'The press will eat them alive. We will see a single drawn member break down in committee and the entire experiment will be dismissed.', true, now() - interval '7 days' - interval '2 hours'),
('objection', 'A four-year term is not long enough to learn the file and not short enough to keep them honest.', true, now() - interval '7 days' - interval '3 hours'),
('objection', 'It removes the only mechanism, however broken, by which I can punish a government I disagree with.', true, now() - interval '7 days' - interval '4 hours'),

('future', 'A binding citizens'' jury, drawn by lot, with veto power over any constitutional amendment. That is all. Keep everything else. Add this.', true, now() - interval '7 days'),
('future', 'Mandatory paid civic service: two weeks every five years, on a citizens'' panel, paid at your own salary. Like jury duty but for policy. Universal. No exceptions.', true, now() - interval '7 days' - interval '1 hour'),
('future', 'Take the upper chamber. Make it sortition. Leave the lower chamber alone. See what happens in twenty years.', true, now() - interval '7 days' - interval '2 hours'),
('future', 'Abolish party lists. Keep elections. Every candidate runs as themselves. No whip. See if anyone survives.', true, now() - interval '7 days' - interval '3 hours'),
('future', 'I would propose that every law over a certain scale must be reviewed, after five years, by a panel drawn by lot, who can repeal it without a vote. A sunset by ordinary people.', true, now() - interval '7 days' - interval '4 hours'),

('speech', 'We have been told for so long that voting is the floor of citizenship that we have forgotten it might also be the ceiling.', true, now() - interval '7 days'),
('speech', 'If you are reading this, I left it for you. I do not know who you are. That is the point.', true, now() - interval '7 days' - interval '1 hour'),
('speech', 'The thing they teach you in school about democracy is mostly the thing that was built to keep you out of it. Read Manin.', true, now() - interval '7 days' - interval '2 hours'),
('speech', 'I think we are tired in a way our grandparents would not recognise. Not because the work is harder. Because nothing we do seems to count. By lot, perhaps, it would.', true, now() - interval '7 days' - interval '3 hours'),
('speech', 'Be specific. The vague version of every political idea is the one that gets used against the people who hold it.', true, now() - interval '7 days' - interval '4 hours'),
('speech', 'What I want you to know is that the silence in your country is not natural. Someone built it.', true, now() - interval '7 days' - interval '5 hours'),
('speech', 'It is possible that the system we have is the best one available. It is also possible that we have stopped looking. These are different sentences.', true, now() - interval '7 days' - interval '6 hours'),
('speech', 'You are not stupid. You have been governed by people who needed you to think you were.', true, now() - interval '7 days' - interval '7 hours');

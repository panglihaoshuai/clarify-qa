import { brainstormingSkill } from './brainstorming'
import { muskSkill } from './musk'
import { jobsSkill } from './jobs'
import { paulGrahamSkill } from './paul-graham'
import { mungerSkill } from './munger'

export const SKILLS: Record<string, string> = {
  brainstorming: brainstormingSkill,
  musk: muskSkill,
  jobs: jobsSkill,
  'paul-graham': paulGrahamSkill,
  munger: mungerSkill,
}

export function getSkillPrompt(skillId: string): string {
  return SKILLS[skillId] ?? SKILLS.brainstorming
}

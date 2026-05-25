export type CutsceneAnim = string | { name: string; offset?: number; source?: string; skin?: string }
export type CutsceneComposite = (CutsceneAnim | CutsceneAnim[])[]
export type CutsceneCompositeDefinition = {
  name?: string
  composite?: CutsceneComposite
  animations?: CutsceneComposite
}
export type CutsceneCompositeEntry = CutsceneComposite | CutsceneCompositeDefinition | CutsceneCompositeDefinition[]

const cutsceneComposites: Record<string, CutsceneCompositeEntry> = {
  "067803": [
    {
      name: "cut_A_all",
      composite: [[
        "cut_A_B_Arm",
        "cut_A",
        { name: "cut_A_B", source: "cutscene/cutscene_char067803_1" },
        { name: "cut_A_F", source: "cutscene/cutscene_char067803_1" }
      ]]
    },
    {
      name: "cut_B_all",
      composite: [[
        "cut_B_Body",
        "cut_B_Ponytail",
        "cut_B_Head",
        { name: "cut_B_B", source: "cutscene/cutscene_char067803_1" },
        { name: "cut_B_Body", source: "cutscene/cutscene_char067803_1" },
        { name: "cut_B_Head", source: "cutscene/cutscene_char067803_1" }
      ]]
    }
  ],
}

export default cutsceneComposites

import React, { createContext, useState, useContext } from "react";

interface QuestListContextType {
  questList: { [key: string]: string }[];
  setQuestList: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }[]>
  >;
}

const QuestListContext = createContext<QuestListContextType | undefined>(
  undefined
);

export const QuestListProvider: React.FC = ({ children }: any) => {
  const [questList, setQuestList] = useState<{ [key: string]: string }[]>([]);

  return (
    <QuestListContext.Provider value={{ questList, setQuestList }}>
      {children}
    </QuestListContext.Provider>
  );
};

export const useQuestList = () => {
  const context = useContext(QuestListContext);
  if (!context) {
    throw new Error("useQuestList must be used within a QuestListProvider");
  }
  return context;
};

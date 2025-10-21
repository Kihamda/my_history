interface MasterGinosho {
  id: string;
  name: string;
  cert: boolean;
  url: string;
}

interface MasterGinoshoSpecified extends MasterGinosho {
  details: MasterGinoshoDetails[];
}

interface MasterGinoshoDetails {
  number: string;
  description: string;
}

interface MasterGrade {
  id: string;
  name: string;
  unit: string;
}

interface MasterGradeSpecified extends MasterGrade {
  details: MasterGradeDetails[];
}

interface MasterGradeDetails {
  number: string;
  description: string;
  cert: boolean;
}

const getMasterGinoshoById = async (
  id: string
): Promise<MasterGinoshoSpecified | undefined> => {
  try {
    const module = await import("./data/ginosho/" + id + ".json");
    return {
      id: module.id,
      name: module.name,
      cert: module.cert,
      url: module.url,
      details: module.details ?? [],
    };
  } catch (error) {
    console.error("Error loading master ginosho:", error);
    return undefined;
  }
};

const getMasterGinoshoLists = async (): Promise<
  MasterGinosho[] | undefined
> => {
  try {
    const ginoshoModule = await import("./data/ginosho.json");
    return ginoshoModule.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        cert: item.cert,
        url: item.url,
      };
    });
  } catch (error) {
    console.error("Error loading master ginosho list:", error);
    return undefined;
  }
};

const getMasterGradeById = async (
  id: string
): Promise<MasterGradeSpecified | undefined> => {
  try {
    const module = await import("./data/grade/" + id + ".json");
    return {
      id: module.id,
      name: module.name,
      unit: module.unit,
      details: module.details ?? [],
    };
  } catch (error) {
    console.error("Error loading master grade:", error);
    return undefined;
  }
};

const getMasterGradeLists = async (): Promise<MasterGrade[] | undefined> => {
  try {
    const gradeModule = await import("./data/grade.json");
    return gradeModule.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
      };
    });
  } catch (error) {
    console.error("Error loading master grade list:", error);
    return undefined;
  }
};

export {
  getMasterGinoshoById,
  getMasterGinoshoLists,
  getMasterGradeById,
  getMasterGradeLists,
};

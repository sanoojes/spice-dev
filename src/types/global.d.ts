declare type SelectOption<T extends string = string> = {
  value: T;
  label?: string;
  hint?: string;
};

declare type SelectOptions<T extends string = string> = SelectOption<T>[];

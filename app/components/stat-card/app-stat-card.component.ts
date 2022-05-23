import angular from "angular";

interface StatCardBindings {
  theme: string | undefined;
  color: string | undefined;
  iconClass: string;
  cardTitle: string;
  onSelectedShowMe: () => null;
  statNumberToDisplay: string;
  statNumberLoading: boolean;
  isSelected: boolean;
}

type Theme =
  | "fusion-yellow"
  | "fusion-teal"
  | "fusion-red"
  | "fusion-purple"
  | "default";

class StatCard implements StatCardBindings {
  //bindings
  theme!: Theme | undefined;
  color!: string | undefined;
  iconClass!: string;
  cardTitle!: string;
  onSelectedShowMe!: () => null;
  statNumberToDisplay!: string;
  statNumberLoading!: boolean;
  isSelected!: boolean;

  $onInit() {
    this.color = this.color || undefined;
    this.theme = this.color ? undefined : this.theme || "default";
    this.iconClass = this.iconClass || "fa fa-users";
    this.cardTitle = this.cardTitle || "Card title";
    this.statNumberToDisplay = this.statNumberToDisplay || "10";
    this.isSelected = this.isSelected;
  }

  applyCustomClass() {
    const themeEnums: Theme[] = [
      "fusion-yellow",
      "fusion-teal",
      "fusion-red",
      "fusion-purple",
    ];
    if (this.theme && themeEnums.includes(this.theme)) {
      return this.isSelected
        ? `${this.theme} ${this.theme}--selected`
        : this.theme;
    } else {
      return this.isSelected ? "default default--selected" : "default";
    }
  }

  // color can be either HEX or RGBA (ex. rgb(0, 0, 0))
  applyCustomColor() {
    if (this.color) {
      return this.isSelected
        ? { color: this.color, "border-color": this.color }
        : { color: this.color, "border-left-color": this.color };
    }
  }
}

const component = {
  selector: "appStatCard",
  templateUrl: "/components/stat-card/app-stat-card.component.html",
  bindings: {
    theme: "@",
    color: "@",
    iconClass: "@",
    cardTitle: "@",
    onSelectShowMe: "&",
    statNumberToDisplay: "@",
    statNumberLoading: "<",
    isSelected: "<",
  },
  controller: StatCard,
  controllerAs: "vm",
};

angular
  .module("otr-ui-shared-components")
  .component(component.selector, component);

declare const Fuse: any;
declare const OtrService: any;
let ctrl: any = null;

interface ICourtsDropdownBindings { // TODO: revisit naming convention
    inputClass: string;
    hasError: boolean;
    onSelectCourt: (selectedCourt: any) => any;
    state: string;
}
class CourtsDropdownComponent implements angular.IComponentOptions {
    public bindings: any;
    public controller: any;
    public controllerAs: string;
    public templateUrl: string;

    constructor() {
        this.bindings = {
            onSelectCourt: '&',
            inputClass: '@',
            hasError: '<',
            state: '@'
        };
        this.controller = CourtsDropdownCtrl;
        this.controllerAs = 'vm';
        this.templateUrl = '/components/courts-dropdown/courts-dropdown.component.html';
    }
}
interface ICourtsDropdownCtrl extends ICourtsDropdownBindings { // TODO: leverage generics here
    classes: string;
    $onInit: () => void;
    $onChanges: (changes: any) => void;
    findMatchingCourts: (query: string) => any[];
}

class CourtsDropdownCtrl implements ICourtsDropdownCtrl {
    static $inject: string[] = ['OtrService'];
    public inputClass: string;
    public hasError: boolean;
    public classes: string;
    public isCourtsLoading: boolean;
    public onSelectCourt!: (selectedCourt: any) => any;
    public state!: string;
    declare public courts: any[];
    public otrService!: any;
    private API_ENDPOINT: string = 'https://otr-backend-service-us-prod.offtherecord.com'; // TODO: any way to use ENV variable?

    constructor(OtrService: any) {
        this.inputClass = '';
        this.hasError = false;
        this.classes = this.inputClass;
        this.isCourtsLoading = false;
        this.otrService = new OtrService({ domain: this.API_ENDPOINT })
    }

    declare private fuseAllKeys: any;
    declare private fuseCourtCode: any;

    $onInit(): void {
        ctrl = this;
    }

    $onChanges(changes: any): void {
        if (changes.hasError) {
            this.classes = this.inputClass + (this.hasError
                ? " has-error"
                : "");
        }
        if (changes.state && this.state) {
            this.fetchCourts()
                .then((courts) => this.initFuse(angular.copy(courts)));
        }
    }

    private async fetchCourts(): Promise<any[]> {
        this.isCourtsLoading = true;
        let response = await this.otrService.findCourtsUsingGET({ state: this.state });
        this.courts = _.forEach(response.data.courts, (court) => {
            court.customTitle = court.courtName;
            court.customTitle += court.courtNameAdditional
                ? ' – ' + court.courtNameAdditional
                : '';
            court.customTitle += court.courtCode
                ? ' (' + court.courtCode + ')'
                : '';
            court.customDescription = court.address.city + ', '
                + court.address.regionCode + ' '
                + court.address.postalCode + ' – '
                + court.address.countyName + ' County';
        });
        this.isCourtsLoading = false;
        return this.courts;
    }

    private initFuse(courts: any[]): void {

        let fuseAllKeysOptions = {
            includeMatches: true,
            includeScore: true,
            distance: 2000,
            threshold: 0.5,
            keys: ['customTitle', 'customDescription']
        };
        try {
            this.fuseAllKeys = new Fuse(courts, fuseAllKeysOptions);
        } catch {
            throw "Dependency fuse.js required";
        }

        let fuseCourtCodeOptions = {
            includeMatches: true,
            includeScore: true,
            distance: 10,
            threshold: 0.1,
            keys: ['courtCode']
        }
        try {
            this.fuseCourtCode = new Fuse(courts, fuseCourtCodeOptions);
        } catch {
            throw "Dependency fuse.js required";
        }
    }

    public findMatchingCourts(query: string): any[] {
        const threshold = 600;
        let allKeysResults: any[] = _.sortBy(ctrl.fuseAllKeys.search(query), 'courtId');
        let courtCodeResults: any[] = _.sortBy(ctrl.fuseCourtCode.search(query), 'courtId');

        let results: any[] = _
            .chain(allKeysResults)
            .unionWith(courtCodeResults, (codeVal, allVal) => {
                let isEqual: boolean = codeVal.item.courtId === allVal.item.courtId;
                if (isEqual) {
                    allVal.score = _.min([codeVal.score, allVal.score])
                }
                return isEqual;
            })
            .sortBy('score')
            .take(threshold)
            .map((result) => {
                result.item.matches = result.matches;
                return result.item;
            })
            .value();

        return results;
    }
}

angular
    .module('courtsDropdown', [])
    .component('courtsDropdown', new CourtsDropdownComponent());
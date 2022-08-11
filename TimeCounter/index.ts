import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class TimeCounter implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private spanElement : HTMLSpanElement;
    private _value : Date;
    private timer :NodeJS.Timer;

    private diffYears: number;
    private diffMonths: number;
    private diffDays: number;
    private diffHours: number;
    private diffMins: number;
    private diffSecs: number;

    /**
     * Empty constructor.
     */
    constructor()
    {
        this.diffYears = this.diffMonths = this.diffDays = this.diffHours = this.diffMins = this.diffSecs = 0;
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this.spanElement = document.createElement('span');
        this.spanElement.setAttribute('class','spanData');
        this.spanElement.setAttribute('id','timeText');
        this.spanElement.innerHTML = '---';
        container.appendChild(this.spanElement);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
        
        if (context.parameters.SubstatusAgeingCounter.raw){
            let currentDate = new Date();
            let data = context.parameters.SubstatusAgeingCounter.raw;

            var diff = currentDate.getTime() - data.getTime();
            diff = diff/ 1000;

            //Getting Years
            this.diffYears = Math.trunc(diff/(12*30*24*60*60));
            diff = diff - (this.diffYears * (12*30*24*60*60));
            
            //Getting Months
            this.diffMonths = Math.trunc(diff/(30*24*60*60));
            diff = diff - (this.diffMonths * (30*24*60*60));

            //Getting Days
            this.diffDays = Math.trunc(diff/(24*60*60));
            diff = diff - (this.diffDays * (24*60*60));

            //Getting Hours
            this.diffHours = Math.trunc(diff/(60*60));
            diff = diff - (this.diffHours * (60*60));

            //Getting Mins
            this.diffMins = Math.trunc(diff/60);
            diff = diff - (this.diffMins * 60);

            //Getting Secs 
            this.diffSecs = Math.trunc(diff);
            
            this.timer = this.timerControl.Start();
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
            SubstatusAgeingCounter: this._value
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        this.timerControl.Stop();
        // Add code to cleanup control if necessary
    }

    private updateSpan(): void{
        let text = '';
        if (this.diffYears != 0) text = text +this.diffYears + 'Y ';
        if (this.diffMonths != 0) text = text +this.diffMonths + 'M ';
        text = text + this.diffDays + 'd '
            + this.diffHours + 'h '
            + this.diffMins + 'm '
            + this.diffSecs + 's';
        this.spanElement.innerHTML = text;
    }

    private _interval  = () =>{
        this.diffSecs = this.diffSecs  + 1;
        if (this.diffSecs == 60){
            this.diffSecs = 0;
            ++ this.diffMins;
        }
        if (this.diffMins == 60){
            this.diffMins = 0;
            ++ this.diffHours;
        }
        if (this.diffHours == 24){
            this.diffHours = 0;
            ++ this.diffDays;
        }
        if (this.diffDays == 30){
            this.diffDays = 0;
            ++ this.diffMonths;
        }
        if (this.diffMonths == 12){
            this.diffMonths = 0;
            ++ this.diffYears;
        }
        this.updateSpan();
    };

    private timerControl = {
        Start: (): NodeJS.Timer =>{
            if (this.timer == null){
                return setInterval(this._interval, 1000);
            }
            return this.timer;
        },
        Stop: (): void =>{
            return clearInterval();
        }
    }
}

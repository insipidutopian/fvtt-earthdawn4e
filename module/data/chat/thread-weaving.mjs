import BaseMessageData from "./base-message.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import SpellcastingWorkflow from "../../workflows/workflow/spellcasting-workflow.mjs";

export default class ThreadWeavingMessageData extends BaseMessageData {

  // region Schema

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      castingMethod: new fields.StringField( {
        required: false,
        blank:    false,
        choices:  Object.keys( SpellcastingWorkflow.CASTING_WORKFLOW_TYPES ),
      } ),
      matrix:           new fields.DocumentUUIDField(),
      grimoire:         new fields.DocumentUUIDField(),
      numThreadsWoven: new fields.NumberField( {
        min:     0,
        integer: true,
      } )
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.ThreadWeavingMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      castSpell:   this._onCastSpell,
    },
  };

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.ChatMessage.threadWeaving,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Properties

  /**
   * The Actor that is rolling the thread weaving.
   * @type {ActorEd|null}
   */
  get caster() {
    return fromUuidSync( this.roll.options.rollingActorUuid );
  }

  /**
   * The spell being cast during the thread weaving.
   * @type {ItemEd|null}
   */
  get spell() {
    return fromUuidSync( this.roll.options.spellUuid );
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadWeavingMessageData}
   */
  static async _onCastSpell( event, button ) {
    event.preventDefault();

    const castingMethod = this.castingMethod;
    const matrix = await fromUuid( this.matrix );
    const grimoire = await fromUuid( this.grimoire );

    const spell = await this._prepareSpell();

    await this.caster.castSpell(
      spell,
      {
        castingMethod,
        matrix,
        grimoire,
      },
    );
  }

  async _prepareSpell() {
    const spell = this.spell;
    if ( spell.system.threads.woven !== this.numThreadsWoven ) {
      return spell.update( { "system.threads.woven": this.numThreadsWoven} );
    }
    return spell;
  }

  // endregion

}
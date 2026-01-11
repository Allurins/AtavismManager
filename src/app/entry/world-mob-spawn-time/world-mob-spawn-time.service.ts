import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {
  DialogCloseType,
  DialogConfig,
  FormConfig,
  FormFieldType,
  QueryParams,
  TableConfig,
  WhereQuery,
} from '../../models/configs';
import {TabTypes} from '../../models/tabTypes.enum';
import {ActionsIcons, ActionsNames, ActionsTypes} from '../../models/actions.interface';
import {ConfigTypes, DropdownValue, FilterTypes} from '../../models/configRow.interface';
import {DatabaseService} from '../../services/database.service';
import {ProfilesService} from '../../settings/profiles/profiles.service';
import {TablesService} from '../../services/tables.service';
import {DataBaseProfile, DataBaseType} from '../../settings/profiles/profile';
import {NotificationService} from '../../services/notification.service';
import {DropdownItemsService} from '../dropdown-items.service';
import {distinctPipe, getProfilePipe, Utils} from '../../directives/utils';
import {mobsFieldConfig} from '../dropdown.config';
import {worldMobSpawnTimeTable} from '../tables.data';

export interface WorldMobSpawnTime {
  id?: number;
  name: string;
  mob_template_id: number;
  instance_id: number;
  spawn_x: number;
  spawn_y: number;
  spawn_z: number;
  orientation_w: number;
  roam_radius: number;
  spawn_time: string;
  despawn_time: string;
  timezone: string;
  days_of_week: string;
  active: boolean;
  respawn_if_killed: boolean;
  last_spawn_date?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorldMobSpawnTimeService {
  public tableKey = TabTypes.WORLD_MOB_SPAWN_TIME;
  private readonly listStream = new BehaviorSubject<WorldMobSpawnTime[]>([]);
  public list = this.listStream.asObservable();
  public dbProfile!: DataBaseProfile;
  public dbTable = worldMobSpawnTimeTable;
  public tableConfig: TableConfig = {
    type: this.tableKey,
    bulkActions: true,
    count: 10,
    fields: {
      id: {type: ConfigTypes.numberType, visible: true, alwaysVisible: true},
      name: {type: ConfigTypes.stringType, visible: true, useAsSearch: true},
      mob_template_id: {
        type: ConfigTypes.dropdown,
        visible: true,
        filterVisible: true,
        filterType: FilterTypes.dynamicDropdown,
        fieldConfig: mobsFieldConfig,
        data: [],
      },
      instance_id: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.integer},
      spawn_x: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.decimal},
      spawn_y: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.decimal},
      spawn_z: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.decimal},
      orientation_w: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.decimal},
      roam_radius: {type: ConfigTypes.numberType, visible: true, filterVisible: true, filterType: FilterTypes.integer},
      spawn_time: {type: ConfigTypes.stringType, visible: true, filterVisible: false},
      despawn_time: {type: ConfigTypes.stringType, visible: true, filterVisible: false},
      timezone: {type: ConfigTypes.stringType, visible: true, filterVisible: false},
      days_of_week: {type: ConfigTypes.stringType, visible: true, filterVisible: false},
      active: {
        type: ConfigTypes.isActiveType,
        visible: true,
        filterVisible: true,
        filterType: FilterTypes.dropdown,
        data: this.dropdownItemsService.isActiveOptions,
        overrideValue: '-1',
      },
      respawn_if_killed: {
        type: ConfigTypes.booleanType,
        visible: true,
        filterVisible: true,
        filterType: FilterTypes.booleanType,
      },
      last_spawn_date: {type: ConfigTypes.date, visible: true, filterVisible: true, filterType: FilterTypes.date},
      created_at: {type: ConfigTypes.date, visible: false, filterVisible: false, filterType: FilterTypes.date},
      updated_at: {type: ConfigTypes.date, visible: false, filterVisible: false, filterType: FilterTypes.date},
    },
    actions: [
      {type: ActionsTypes.EDIT, name: ActionsNames.EDIT, icon: ActionsIcons.EDIT},
      {type: ActionsTypes.DUPLICATE, name: ActionsNames.DUPLICATE, icon: ActionsIcons.DUPLICATE},
      {type: ActionsTypes.MARK_AS_REMOVED, name: ActionsNames.DEACTIVATE, icon: ActionsIcons.MARK_AS_REMOVED},
      {type: ActionsTypes.RESTORE, name: ActionsNames.ACTIVATE, icon: ActionsIcons.RESTORE},
      {type: ActionsTypes.DELETE, name: ActionsNames.MARK_AS_REMOVED, icon: ActionsIcons.DELETE},
    ],
    queryParams: {search: '', where: {}, sort: {field: 'name', order: 'asc'}, limit: {limit: 10, page: 0}},
  };
  public formConfig: FormConfig = {
    type: this.tableKey,
    dialogType: DialogConfig.normalDialogOverlay,
    title: this.translate.instant(this.tableKey + '.ADD_TITLE'),
    fields: {
      name: {name: 'name', type: FormFieldType.input, require: true, length: 128},
      mob_template_id: {
        name: 'mob_template_id',
        type: FormFieldType.dynamicDropdown,
        fieldConfig: mobsFieldConfig,
        search: true,
        require: true,
        allowNew: true,
      },
      instance_id: {name: 'instance_id', type: FormFieldType.integer, require: true},
      spawn_x: {name: 'spawn_x', type: FormFieldType.decimal, require: true, width: 33},
      spawn_y: {name: 'spawn_y', type: FormFieldType.decimal, require: true, width: 33},
      spawn_z: {name: 'spawn_z', type: FormFieldType.decimal, require: true, width: 33},
      orientation_w: {name: 'orientation_w', type: FormFieldType.decimal, require: true, width: 33},
      roam_radius: {name: 'roam_radius', type: FormFieldType.integer, require: true, width: 33},
      spawn_time: {name: 'spawn_time', type: FormFieldType.input, require: true, length: 16, width: 50},
      despawn_time: {name: 'despawn_time', type: FormFieldType.input, require: true, length: 16, width: 50},
      timezone: {name: 'timezone', type: FormFieldType.input, require: true, length: 32},
      days_of_week: {name: 'days_of_week', type: FormFieldType.input, require: true, length: 20},
      active: {name: 'active', type: FormFieldType.boolean},
      respawn_if_killed: {name: 'respawn_if_killed', type: FormFieldType.boolean},
      last_spawn_date: {name: 'last_spawn_date', type: FormFieldType.fillDateTimePicker},
    },
  };
  private destroyer = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly databaseService: DatabaseService,
    private readonly profilesService: ProfilesService,
    private readonly tablesService: TablesService,
    private readonly notification: NotificationService,
    private readonly dropdownItemsService: DropdownItemsService,
  ) {}

  public init(): void {
    this.profilesService.profile.pipe(getProfilePipe(this.destroyer)).subscribe((profile) => {
      const latestProfile = profile.databases.find(
        (dbProfile) => dbProfile.type === DataBaseType.world_content,
      ) as DataBaseProfile;
      const defaultIsActiveFilter =
        typeof profile.defaultIsActiveFilter !== 'undefined' ? String(profile.defaultIsActiveFilter) : '-1';
      this.tableConfig.fields.active.overrideValue = defaultIsActiveFilter;
      if (defaultIsActiveFilter === '1' || defaultIsActiveFilter === '0') {
        (this.tableConfig.queryParams.where as WhereQuery).active = defaultIsActiveFilter;
      }
      if (!Utils.equals(latestProfile, this.dbProfile)) {
        this.dbProfile = latestProfile;
        this.loadOptions();
      }
    });
    this.dropdownItemsService.mobs.pipe(distinctPipe(this.destroyer)).subscribe((listing) => {
      this.tableConfig.fields.mob_template_id.data = listing;
    });
    this.tablesService.reloadActiveTab.pipe(distinctPipe(this.destroyer)).subscribe(() => {
      this.loadOptions();
    });
  }

  public async loadOptions(): Promise<void> {
    await this.dropdownItemsService.getMobs();
  }

  public async getList(queryParams: QueryParams, loadAll = false): Promise<void> {
    if (loadAll) {
      this.dropdownItemsService.getMobs();
    }
    const response = await this.databaseService.queryList<WorldMobSpawnTime>(
      this.dbProfile,
      this.dbTable,
      this.tableConfig.fields,
      queryParams,
    );
    this.tableConfig.count = response.count;
    this.listStream.next(response.list);
  }

  public async addItem(): Promise<null | DropdownValue> {
    this.formConfig.title = this.translate.instant(this.tableKey + '.ADD_TITLE');
    this.formConfig.submit = this.translate.instant('ACTIONS.SAVE');
    const formConfig = JSON.parse(JSON.stringify(this.formConfig));
    const form = this.createForm();
    let {item} = await this.tablesService.openDialog<WorldMobSpawnTime>(formConfig, form);
    if (!item) {
      form.reset();
      this.tablesService.dialogRef = null;
      return null;
    }
    item = this.setDefaults(item);
    const newId = await this.databaseService.insert<WorldMobSpawnTime>(this.dbProfile, this.dbTable, item);
    form.reset();
    this.tablesService.dialogRef = null;
    return {id: newId, value: item.name};
  }

  public async updateItem(id: number): Promise<null | DropdownValue> {
    const record = await this.databaseService.queryItem<WorldMobSpawnTime>(this.dbProfile, this.dbTable, 'id', id);
    if (!record) {
      return null;
    }
    let {item, action} = await this.prepareForm(record, true);
    if (!item) {
      return null;
    }
    item.created_at = record.created_at;
    let newId = record.id;
    if (action === DialogCloseType.save_as_new) {
      delete item.id;
      item.created_at = this.databaseService.getTimestampNow();
      item = this.setDefaults(item);
      newId = await this.databaseService.insert<WorldMobSpawnTime>(this.dbProfile, this.dbTable, item);
    } else {
      item = this.setDefaults(item, true);
      await this.databaseService.update<WorldMobSpawnTime>(this.dbProfile, this.dbTable, item, 'id', record.id as number);
      this.notification.success(this.translate.instant('CONCLUSION.SUCCESSFULLY_UPDATED'));
    }
    return {id: newId, value: item.name};
  }

  public setDefaults(item: WorldMobSpawnTime, keepCreation = false): WorldMobSpawnTime {
    item.active = typeof item.active === 'undefined' ? true : item.active;
    item.orientation_w = item.orientation_w ? item.orientation_w : 1;
    item.roam_radius = item.roam_radius ? item.roam_radius : 0;
    item.days_of_week = item.days_of_week ? item.days_of_week : '1,2,3,4,5,6,7';
    item.timezone = item.timezone ? item.timezone : 'Europe/Moscow';
    item.respawn_if_killed = item.respawn_if_killed ? item.respawn_if_killed : false;
    // DB column is DATE, avoid sending empty string
    if (!item.last_spawn_date) {
      item.last_spawn_date = null;
    } else if (typeof item.last_spawn_date === 'string' && item.last_spawn_date.trim() === '') {
      item.last_spawn_date = null;
    }
    if (!keepCreation) {
      item.created_at = item.created_at ? item.created_at : this.databaseService.getTimestampNow();
    }
    item.updated_at = this.databaseService.getTimestampNow();
    return item;
  }

  public async duplicateItem(id: number): Promise<number> {
    const baseRecord = await this.databaseService.queryItem<WorldMobSpawnTime>(this.dbProfile, this.dbTable, 'id', id);
    if (!baseRecord) {
      return 0;
    }
    const record = {...baseRecord};
    delete record.id;
    record.name = record.name + ' (1)';
    const {item} = await this.prepareForm(record);
    if (!item) {
      return 0;
    }
    const newItem = this.setDefaults(item);
    const newId = await this.databaseService.insert<WorldMobSpawnTime>(this.dbProfile, this.dbTable, newItem, false);
    this.notification.success(this.translate.instant('CONCLUSION.DUPLICATION_SUCCESS'));
    return newId;
  }

  private async prepareForm(
    record: WorldMobSpawnTime,
    updateMode = false,
  ): Promise<{item: WorldMobSpawnTime | undefined; action: DialogCloseType}> {
    this.formConfig.title = this.translate.instant(this.tableKey + '.EDIT_TITLE');
    this.formConfig.submit = this.translate.instant('ACTIONS.UPDATE');
    const formConfig = JSON.parse(JSON.stringify(this.formConfig));
    const form = this.createForm();
    form.patchValue({...record});
    formConfig.saveAsNew = updateMode;
    const {item, action} = await this.tablesService.openDialog<WorldMobSpawnTime>(formConfig, form);
    if (!item) {
      form.reset();
      this.tablesService.dialogRef = null;
      return {item: undefined, action};
    }
    form.reset();
    this.tablesService.dialogRef = null;
    return {item: this.setDefaults(item, updateMode), action};
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      mob_template_id: ['', Validators.required],
      instance_id: [1, [Validators.required, Validators.min(1)]],
      spawn_x: [0, Validators.required],
      spawn_y: [0, Validators.required],
      spawn_z: [0, Validators.required],
      orientation_w: [1, Validators.required],
      roam_radius: [0, [Validators.required, Validators.min(0)]],
      spawn_time: ['', Validators.required],
      despawn_time: ['', Validators.required],
      timezone: ['Europe/Moscow', Validators.required],
      days_of_week: ['1,2,3,4,5,6,7', Validators.required],
      active: [true],
      respawn_if_killed: [false],
      last_spawn_date: [null],
    });
  }

  public destroy(): void {
    this.tableConfig.queryParams = {
      search: '',
      where: {},
      sort: {field: 'name', order: 'asc'},
      limit: {limit: 10, page: 0},
    };
    this.destroyer.next(void 0);
    this.destroyer.complete();
  }
}

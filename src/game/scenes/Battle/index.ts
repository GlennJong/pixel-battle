import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import { sceneStarter, sceneFinisher } from '../../components/CircleSceneTransition';
import { originalHeight, originalWidth } from '../../constants';
import { Menu } from './Menu';
import { KeyboardHandler } from '@/game/handlers/KeyboardHander';
import { EventBus } from '@/game/EventBus';
import { introduction } from './introduction';

const aboutDialogue = [{
  portrait: 'battle_afk_self_currycat_face_normal',
  text: '這是咖哩貓做的貞貞俱樂部二創小遊戲。\n雖然是仿造部分寶〇夢回合制的遊戲架構和畫幾幅貞貞俱樂部角色的像素圖，\n已經滿足我想做遊戲的小小願望！\n希望你有喜歡！',
}];

const winDialogue = [{
  portrait: 'battle_afk_self_face_normal',
  text: '恭喜你過關了！\n然而還有其他人等著要挑戰...'
}]

const continueDialogue = [{
  portrait: 'battle_afk_self_face_normal',
  text: '你要繼續挑戰嗎？'
}]

const finishingDialogue = [{
  portrait: 'battle_afk_self_face_normal',
  text: '喜歡這個小遊戲嗎？\n歡迎給我回饋！\n歡迎追蹤貞尼鹹粥！加入貞貞俱樂部！\n88888！'
}];

const continueList = ['換人挑戰', '關於遊戲', '離開'];

function getActionList() {
  const actionOptions = ['行動', '恢復', '你是誰'];
  const secretActionOptions = ['行動', '恢復', '你是誰', '換人挑戰'];
  return isSecretMode ?  secretActionOptions : actionOptions;
}

const basicBattleList = [
  { text: '安迪', value: 'jennie' },
  { text: '貝貝', value: 'beibei' },
  { text: '上上', value: 'shangshang' },
  { text: '貓辣妹', value: 'maoramei' },
  { text: '咖哩貓', value: 'currycat' }
];
const secretBattleList = [
  { text: 'ㄐㄎ', value: 'ai4vupwjp' },
  { text: '小咖', value: 'ka' },
  { text: '搭拉', value: 'dara' },
  { text: '還要更快', value: 'fast' },
  { text: '是小蝶', value: 'hudeijun' },
  { text: '問問', value: 'p13p04' },
  { text: '爬慶狗', value: 'pachin' },
  { text: '龐琪', value: 'pumpkin' },
  { text: 'BBB', value: 'bbb' },
  { text: '橙踏青', value: 'touching' },
];
function getBattleList() {
  return isSecretMode ?
    [
      ...basicBattleList.map(({ text }) => text),
      ...secretBattleList.map(({ text }) => text)
    ]
    :
    basicBattleList.map(({ text }) => text);
  // return [
  //     ...basicBattleList.map(({ text }) => text),
  //     ...secretBattleList.map(({ text }) => text)
  //   ];
}

let isAllowRecover = true;
let isSecretModeReady = false;
let isSecretMode = false;

export default class Battle extends Scene {
  opponentName: string = 'default';
  background?: Phaser.GameObjects.Rectangle;
  self?: BattleCharacter;
  opponent?: BattleCharacter;
  menu?: Menu;
  dialogue?: PrimaryDialogue;
  keyboardHandler?: KeyboardHandler;

  constructor() {
    super('Battle');
  }

  preload() {
    this.load.setPath('assets');
  }

  create() {
    
    // background
    this.background = this.add.rectangle(0, 0, originalWidth, originalHeight, 0xeeeeee)
    .setDepth(0)
    .setOrigin(0);

    let opponentName = 'default';
    const data = this.scene.settings.data as { opponentName?: string } | undefined;
    if (data && typeof data.opponentName === 'string') {
      opponentName = data.opponentName;
    } else {
      const params = new URLSearchParams(document.location.search);
      opponentName = params.get('opponent') || opponentName;
    }
    this.opponentName = opponentName;

    // init characters
    this.opponent = new BattleCharacter(
      this,
      `battle_${opponentName}_opponent`,
      'opponent',
    );
    this.opponent.setDepth(1);
    this.opponent.board?.setDepth(1);

    this.self = new BattleCharacter(
      this,
      'battle_afk_self',
      'self',
    );
    this.self.setDepth(1);
    this.self.board?.setDepth(1);

    this.keyboardHandler = new KeyboardHandler(this, {
      onUp: () => this.handleControlButton('up'),
      onDown: () => this.handleControlButton('down'),
      onSpace: () => this.handleControlButton('space')
    });
    EventBus.on('game-up-keydown', () => {this.handleControlButton('up')})
    EventBus.on('game-down-keydown', () => this.handleControlButton('down'))
    EventBus.on('game-select-keydown', () => this.handleControlButton('space'))

    EventBus.on('game-preinput-secret-mode', () => {
      isSecretModeReady = true;
    })
    EventBus.on('game-input-secret-mode', () => {
      isSecretMode = true;
      isSecretModeReady = false;
      this.handleStartSecretMode();
    })
    EventBus.on('game-cancel-secret-mode', () => {
      isSecretModeReady = false;
    })
    
    // default hide status board
    this.self.hideBoard();
    this.opponent.hideBoard();

    // init dialogue
    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.initDialogue();
    this.dialogue.setDepth(2);

    // init Menu
    this.menu = new Menu(this, {
      actions: []
    });
    this.menu.init();
    this.menu.hideMenu();
    this.menu.setDepth(3);
    
    sceneStarter(this);
    this.handleStartGameScene();

    this.events.on('shutdown', this.shutdown, this);
  }

  update() {
    this.self?.characterHandler();
    this.opponent?.characterHandler();
    this.keyboardHandler?.update();
  }

  private async applyAttackTurn() {
    const turns = ['self', 'opponent'];
    for (let i = 0; i < turns.length; i++) {
      const from = turns[i];
      // action movement
      const actionCharacter = from === 'self' ? this.self : this.opponent;
      const currentAction = actionCharacter!.getRandomAction();
      const actionResult = actionCharacter!.runAction(currentAction);

      if (!actionResult) return;
      const { effect, dialog: actionDialog } = actionResult;
      
      if (!effect) return;
      const { type, target } = effect;
      let { value } = effect;
      await this.dialogue!.runDialogue(actionDialog);
  
      // reaction movement
      const sufferCharacter = target === 'self' ? this.self : this.opponent;

      if (target === 'opponent' && isSecretMode) {
        value = value * 2;
      }
      const reactionResult = await sufferCharacter!.runReaction(type, value || 0);
  
      if (!reactionResult) return;
      const { dialog: sufferDialog, isDead } = reactionResult;
      await this.dialogue!.runDialogue(sufferDialog);
  
      
      if (isDead) {
        const winResult = actionCharacter!.runResult('win');
        if (!winResult) return;
        const { dialog: winnerDialog } = winResult;
        await this.dialogue!.runDialogue(winnerDialog);
  
        sufferCharacter!.runResult('lose');
        const loseResult = sufferCharacter!.runResult('lose');
  
        
        if (!loseResult) return;
        const { dialog: loserDialog } = loseResult;
        await this.dialogue!.runDialogue(loserDialog);
  
        const isSelfWin = from === 'self';
        this.handleFinishGame(isSelfWin);
        return;
      }
      else {
        this.handleSelectAction();
      }
    }
    
  }
  private async applyRecoverTurn() {
    const actionCharacter = this.self;
    const currentAction = actionCharacter!.getRecoverAction();
    const actionResult = actionCharacter!.runAction(currentAction);

    if (!actionResult) return;
    const { effect, dialog: actionDialog } = actionResult;
    
    if (!effect) return;
    const { type, target, value } = effect;
    await this.dialogue!.runDialogue(actionDialog);

    // reaction movement
    const sufferCharacter = target === 'self' ? this.self : this.opponent;
    const reactionResult = await sufferCharacter!.runReaction(type, value || 0);

    if (!reactionResult) return;
    const { dialog: sufferDialog } = reactionResult;
    await this.dialogue!.runDialogue(sufferDialog);

    isAllowRecover = false;
    this.handleSelectAction();
  }

  private async applyTalking() {
    await this.dialogue!.runDialogue(introduction[this.opponentName]);
    this.handleSelectAction();
  }

  private async continueGame() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: '你要跟誰戰鬥呢？',
    }]);

    const list = getBattleList();
    this.menu?.setActions(list);
    this.menu?.showMenu();
  }

  private async handleControlButton(key: 'up' | 'down' | 'space') {
    if (isSecretModeReady) return;
    if (key === 'up') {
      this.menu?.prevAction();
    } else if (key === 'down') {
      this.menu?.nextAction();
    } else if (key === 'space') {
      const menuAction = this.menu?.select();
      if (menuAction) {
        this.menu?.hideMenu();
        if (menuAction === '行動') {
          await this.applyAttackTurn();
        }
        else if (menuAction === '恢復') {
          if (isAllowRecover || isSecretMode) {
            await this.applyRecoverTurn();
          }
          else {
            await this.dialogue!.runDialogue([{
              portrait: 'battle_afk_self_face_normal',
              text: '每次對戰我只能小睡一次...\n現在很有精神！',
            }]);
            this.menu?.showMenu();
          }
        }
        else if (menuAction === '你是誰') {
          await this.applyTalking();
        }
        else if (menuAction === '關於遊戲') {
          await this.dialogue!.runDialogue(aboutDialogue);
          this.menu?.showMenu();
        }
        else if (menuAction === '離開') {
          await this.dialogue!.runDialogue(finishingDialogue);
          await sceneFinisher(this);
          window.dispatchEvent(new CustomEvent('game-finish'));
        }
        else if (menuAction === '換人挑戰') {
          isAllowRecover = true;
          await this.continueGame();
        }
        else if ([...basicBattleList, ...secretBattleList].map(({ text }) => text).includes(menuAction)) {
          const result = [...basicBattleList, ...secretBattleList].find(({ text }) => text === menuAction);
          if (result) {
            this.restartBattle(result.value);
          }
        }
      }
    }
  }

  private async restartBattle(opponentName: string) {
    await this.dialogue?.runDialogue([{
      portrait: 'battle_afk_self_face_angry',
      text: '下一位挑戰者來了！',
    }]);
    await sceneFinisher(this);
    this.scene.restart({ opponentName });
  }

  private async handleStartGameScene() {
    await this.openingCharacterMovement();
    this.handleSelectAction();
  }

  private async handleSelectAction() {
    await this.dialogue?.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: '要做什麼呢？',
    }]);
    const list = getActionList();
    this.menu?.setActions(list);
    this.menu?.showMenu();
  }

  private async handleStartSecretMode() {
    this.menu?.hideMenu();
    await this.dialogue?.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: '你發現了秘技！\n現在可以無限次恢復！攻擊力2倍！\n並且解鎖全人物挑戰！',
    }]);
    const list = getActionList();
    this.menu?.setActions(list);
    this.menu?.showMenu();
  }

  private async handleFinishGame(isWin: boolean) {
    if (isWin) {
      await this.dialogue!.runDialogue(winDialogue);
    }
    await this.dialogue!.runDialogue(continueDialogue);
    this.menu?.setActions(continueList);
    this.menu?.showMenu();
  }

  private async openingCharacterMovement() {
    this.self!.character.setAlpha(0);
    this.opponent!.character.setAlpha(0);

    // run self opening animation
    this.self!.character.setAlpha(1);
    await this.self!.openingCharacter();

    // run battle introduce
    const selfStartDialog = this.self!.runStart();

    if (selfStartDialog) {
      await this.dialogue!.runDialogue(selfStartDialog);
    };

    // run opponent opening animation
    this.opponent!.character.setAlpha(1);
    await this.opponent!.openingCharacter();

    const opponentStartDialog = this.opponent!.runStart();
    if (opponentStartDialog) {
      await this.dialogue!.runDialogue(opponentStartDialog);
    };

    // show status board for both
    this.self?.showBoard()
    this.opponent?.showBoard()
  }
  shutdown() {
    this.menu?.destroy();
    this.keyboardHandler?.destroy();
    this.opponent!.destroy();
    this.self!.destroy();
    EventBus.off('game-up-keydown');
    EventBus.off('game-down-keydown');
    EventBus.off('game-select-keydown');
    EventBus.off('game-preinput-secret-mode');
    EventBus.off('game-input-secret-mode');
    EventBus.off('game-cancel-secret-mode');
  }
}

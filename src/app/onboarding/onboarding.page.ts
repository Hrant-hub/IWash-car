import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';

register();

interface Slide {
  icon: string;
  accentIcon?: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false,
})
export class OnboardingPage {
  currentIndex = 0;

  slides: Slide[] = [
    {
      icon: 'car-sport-outline',
      accentIcon: 'water-outline',
      title: 'Ավտոլվացում՝ հենց ձեր գտնվելու վայրում',
      text: 'Պատվիրեք մոտակա օգնականին՝ արագ արտաքին լվացման և խնամքի համար։',
    },
    {
      icon: 'map-outline',
      accentIcon: 'car-sport-outline',
      title: 'Օգնականներ՝ ձեր մոտակայքում',
      text: 'Մենք ավտոմատ գտնում ենք ամենամոտ հասանելի օգնականին։',
    },
    {
      icon: 'sparkles-outline',
      accentIcon: 'car-sport-outline',
      title: 'Արագ, մաքուր, վստահելի',
      text: 'Մեկ հպումով միացեք մոտակայքի ակտիվ ավտոլվացման օգնականներին։',
    },
  ];

  constructor(
    private router: Router
  ) {}

  onSlideChanged(event: Event): void {
    const el = event.target as HTMLElement & { swiper?: { activeIndex: number } };
    this.currentIndex = el.swiper?.activeIndex ?? 0;
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }
}
